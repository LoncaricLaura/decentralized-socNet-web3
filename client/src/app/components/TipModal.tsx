import { useState } from "react";

export default function TipModal({ onClose, onConfirm }: { onClose: () => void, onConfirm: (amount: string) => void }) {
  const [amount, setAmount] = useState("2");

  return (
    <div className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
      <div className="relative w-[85%] sm:w-1/2 lg:w-1/3 h-fit overflow-auto bg-[#cfcccc] rounded-md px-4 py-8 flex flex-col items-center gap-6 text-black">
        <h2 className="text-lg mb-4">Tip User</h2>
        <button
            className="absolute top-8 right-4"
            onClick={onClose}
        >
            <img
                src="/icons/icon-close.png"
                alt="Icon Close"
                width={25}
                height={25}
            />
        </button>
        <div className="flex justify-center items-center">
            <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <img
                src="/images/spark.png"
                alt="Icon Close"
                width={25}
                height={25}
              />
            <p>SPK</p>
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onConfirm(amount)}
            className="font-bold px-4 py-2 text-sm md:text-md bg-gradient-to-r from-[#7ca3f0]/60 to-[#4a90e2]/60 text-[#121212] rounded-md min-w-20 md:min-w-32 w-fit"
          >
            Tip
          </button>
        </div>
      </div>
    </div>
  );
}
