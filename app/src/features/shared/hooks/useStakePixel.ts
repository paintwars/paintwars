import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CONTRACTS } from "./utils";
import { maxUint256, parseEther } from "viem";
import { useMemo } from "react";
import { toast } from "react-toastify";

export type UseStakePixelProps = {
  pixelId: number;
  amount: string;
  color: number;
};

export type UseStakePixelResult = {
  stake: () => Promise<void>;
  approve: () => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  needsApproval: boolean;
};

export function useStakePixel({
  pixelId,
  amount,
  color,
}: UseStakePixelProps): UseStakePixelResult {
  const { address: account } = useAccount();
  const {
    writeContractAsync,
    data: hash,
    error,
    isPending,
  } = useWriteContract();

  const { data: allowance, refetch } = useReadContract({
    ...CONTRACTS.Token,
    functionName: "allowance",
    args: [account, CONTRACTS.PixelStaking.address],
  });

  const needsApproval = useMemo(() => {
    if (allowance === undefined || allowance === null) return false;
    return BigInt(allowance as bigint) < parseEther(amount || "0");
  }, [allowance, amount]);

  const approve = async () => {
    try {
      await writeContractAsync({
        ...CONTRACTS.Token,
        functionName: "approve",
        args: [CONTRACTS.PixelStaking.address, maxUint256],
      });
      toast.success("Approved max PXMT to pixelStaking contract");
      await refetch();
    } catch (error: any) {
      console.error("Approval error: ", error);
      toast.error(error.shortMessage);
    }
  };

  const stake = async () => {
    try {
      console.log("staking", {
        pixelId: BigInt(pixelId),
        tokenAddress: CONTRACTS.Token.address,
        amount: parseEther(amount),
        color: BigInt(color),
      });
      await writeContractAsync({
        ...CONTRACTS.PixelStaking,
        functionName: "changePixelCrossChain",
        args: [
          BigInt(pixelId),
          CONTRACTS.Token.address,
          parseEther(amount),
          BigInt(color),
        ],
      });
      toast.success("Pixel staked successfully!");
    } catch (error: any) {
      console.error("Staking error: ", error);
      toast.error(error.shortMessage);
    }
  };

  const { isSuccess, isLoading } = useWaitForTransactionReceipt({
    hash: hash,
  });

  if (error) {
    console.log("error", error);
  }
  return {
    stake,
    approve,
    isLoading,
    isSuccess,
    error,
    needsApproval,
  };
}
