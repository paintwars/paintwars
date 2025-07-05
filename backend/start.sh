ENV_FILE="../.env"
if [ -f "$ENV_FILE" ]; then
  # turn on automatic export of all vars
  set -o allexport
  source "$ENV_FILE"
  # turn off auto-export
  set +o allexport
fi

exec uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1
