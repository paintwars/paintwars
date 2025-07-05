'use client';
import { HEIGHT, WIDTH } from '@/utils';
import Image from 'next/image';
import { Viewport } from 'pixi-viewport';
import { Application, Container, type EventSystem } from 'pixi.js';
import { useEffect, useRef, useState } from 'react';
import GridDisplay, { BASE_PIXEL_SIZE } from './components/GridDisplay';

export default function Home() {
  // Create layer
  const layer = new Container();
  layer.eventMode = 'static';
  layer.cursor = 'pointer';

  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<Container>(layer);
  const appRef = useRef<Application>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Function to initialize the application
    const initializeApp = async () => {
      // Check if container is available
      if (!containerRef.current) {
        return;
      }

      // Avoid multiple initializations
      if (appRef.current) {
        return;
      }

      // Initialize Pixi.js application
      const app = new Application();
      appRef.current = app;

      await app.init({
        backgroundAlpha: 1,
        resizeTo: containerRef.current,
        resolution: window.devicePixelRatio || 1,
        antialias: true,
        backgroundColor: 0x2c2e31,
      });

      // Check if app was destroyed during initialization
      if (!appRef.current) {
        return;
      }

      // Check if container is still available
      if (!containerRef.current) {
        app.destroy(true, true);
        return;
      }

      // Add canvas to container
      containerRef.current.appendChild(app.canvas);

      const worldWidth = WIDTH * BASE_PIXEL_SIZE;
      const worldHeight = HEIGHT * BASE_PIXEL_SIZE;

      console.warn(containerRef.current.clientWidth, containerRef.current.clientHeight);
      // Create viewport
      const viewport = new Viewport({
        screenWidth: containerRef.current.clientWidth,
        screenHeight: containerRef.current.clientHeight,
        worldWidth,
        worldHeight,
        events: app.renderer.events,
        disableOnContextMenu: true,
        ticker: app.ticker,
        noTicker: false,
      });

      viewport.eventMode = 'static';
      viewport.sortableChildren = true;

      // Configure viewport based on platform
      viewport
        .drag({
          mouseButtons: 'all',
          wheel: false,
        })
        .wheel({
          smooth: 20,
        })
        .clampZoom({
          minScale: 0.1,
          maxScale: 3,
        });

      // Adjust scale
      const widthScale = containerRef.current.clientWidth / worldWidth;
      const heightScale = containerRef.current.clientHeight / worldHeight;
      const scale = Math.min(widthScale, heightScale) * 0.45;
      const scaleX = widthScale * 0.45;
      const scaleY = heightScale * 0.45;

      viewport.setZoom(scale);

      // Center viewport
      const offsetX = (containerRef.current.clientWidth - worldWidth * scaleX) / 2.2;
      const offsetY = (containerRef.current.clientHeight - worldHeight * scaleY) / 2.2;
      viewport.moveCenter(worldWidth / 2 + offsetX / scale, worldHeight / 2 + offsetY / scale);

      // Create layer
      const layer = new Container();
      layer.eventMode = 'static';
      layer.cursor = 'pointer';

      viewport.addChild(layer);

      viewportRef.current = viewport;
      layerRef.current = layer;
      app.stage.addChild(viewport);
      app.ticker.minFPS = 0;
      app.ticker.start();

      setIsInitialized(true);
    };

    initializeApp();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && viewportRef.current) {
        viewportRef.current.screenWidth = containerRef.current.clientWidth;
        viewportRef.current.screenHeight = containerRef.current.clientHeight;

        const worldWidth = WIDTH * BASE_PIXEL_SIZE;
        const worldHeight = HEIGHT * BASE_PIXEL_SIZE;
        const newWidthScale = containerRef.current.clientWidth / worldWidth;
        const newScale = newWidthScale * 0.45;

        viewportRef.current.setZoom(newScale);

        const newOffsetX = (containerRef.current.clientWidth - worldWidth * newScale) / 2.2;
        const newOffsetY = (containerRef.current.clientHeight - worldHeight * newScale) / 2.2;
        viewportRef.current.moveCenter(
          worldWidth / 2 + newOffsetX / newScale,
          worldHeight / 2 + newOffsetY / newScale
        );
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {};
  }, []);

  return (
    <main className="flex flex-col  items-center max-w-screen max-h-screen">
      <div
        ref={containerRef}
        className="max-w-screen max-h-screen"
        style={{ width: '100%', height: '100%' }}
      />

      {isInitialized ? <GridDisplay layer={layerRef.current} /> : 'Loading...'}
    </main>
  );
}
