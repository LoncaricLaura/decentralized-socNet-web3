import Image from 'next/image';

interface LikesModalProps {
    likers: string[];
    onClose: () => void;
  }
  
  export default function LikesModal({ likers, onClose }: LikesModalProps) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#121212]/85 z-50">
        <div className="relative bg-white p-4 rounded-lg shadow-md w-80">
          <h2 className="text-lg font-bold mb-4">Liked by</h2>
          <ul className="space-y-2">
            {likers.map((liker, index) => (
              <li key={index} className="text-sm text-gray-600">
                {liker}
              </li>
            ))}
          </ul>
          <button
              className="absolute top-4 right-4"
              onClick={onClose}
            >
                <Image 
                    src="/icons/icon-close.png"
                    alt="Icon Close"
                    width={20}
                    height={20}
                />
            </button>
        </div>
      </div>
    );
  }
  