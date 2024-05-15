import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getContract, formatEther, createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { stableTokenABI } from "@celo/abis"; // Fixed import statement

export default function Home() {
  const [userAddress, setUserAddress] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const [userBalance, setUserBalance] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && address) {
        setUserAddress(address);

        const STABLE_TOKEN_ADDRESS =
          "0x765DE816845861e75A25fCA122bb6898B8B1282a";

        const publicClient = createPublicClient({
          chain: celo,
          transport: http(),
        });

        const checkCUSDBalance = async (
          publicClient: any,
          address: string
        ): Promise<string> => {
          const StableTokenContract = getContract({
            abi: stableTokenABI,
            address: STABLE_TOKEN_ADDRESS,
            publicClient,
          });

          const balanceInBigNumber = await StableTokenContract.read.balanceOf([
            address,
          ]);
          const balanceInWei = balanceInBigNumber.toString();
          const balanceInEthers = formatEther(balanceInWei);

          return balanceInEthers;
        };

        try {
          const balance = await checkCUSDBalance(publicClient, address);
          setUserBalance(balance);
        } catch (error) {
          console.error("Failed to fetch balance:", error);
        }
      }
    };

    fetchBalance();
  }, [address, isConnected]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="h1">
        There you go... a canvas for your next Celo project!
      </div>
      {isConnected ? (
        <>
          <div className="h2 text-center">Your address: {userAddress}</div>
          <div className="h2 text-center">Your cUSD balance: {userBalance}</div>
        </>
      ) : (
        <div>No Wallet Connected</div>
      )}
    </div>
  );
}
