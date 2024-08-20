import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getFile } from '../ipfs';
import { fileTypeFromBuffer } from 'file-type';

interface MediaType {
  url: string;
  type: string;
}

interface PostSwiperProps {
  mediaUrls: string[];
}

export default function PostSwiper({ mediaUrls }: PostSwiperProps) {
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([]);

  useEffect(() => {
    const determineMediaTypes = async () => {
      const types: MediaType[] = [];

      for (const url of mediaUrls) {
        try {
          const cid = url.split('/').pop();
          if (cid) {
            const fileBuffer = await getFile(cid);
            const type = await fileTypeFromBuffer(fileBuffer);
            types.push({ url, type: type?.mime || 'unknown' });
          }
        } catch (error) {
          console.error(`Error fetching media type for ${url}:`, error);
          types.push({ url, type: 'unknown' });
        }
      }

      setMediaTypes(types);
    };

    determineMediaTypes();
  }, [mediaUrls]);

  const renderMedia = (url: string, type: string) => {
    if (type.startsWith('image/')) {
      return (
        <Image
          src={url}
          alt="Post media"
          width={600}
          height={400}
          className="rounded-lg"
          objectFit="cover"
          style={{ width: '100%', height: 'auto' }}
        />
      );
    } else if (type.startsWith('video/')) {
      return (
        <video
          width="320"
          height="240"
          controls
          autoPlay
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        >
          <source src={url} type={type} />
          Your browser does not support the video tag.
        </video>

      );
    }
  };

  if (mediaUrls.length === 1) {
    const singleUrl = mediaUrls[0];
    const mediaType = mediaTypes.find(media => media.url === singleUrl)?.type || 'unknown';
    return (
      <div style={{ maxWidth: '100%', maxHeight: 'auto' }}>
        {renderMedia(singleUrl, mediaType)}
      </div>
    );
  }

  return (
    <Swiper
      pagination={{ type: 'fraction' }}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="mySwiper"
      style={{ maxWidth: '100%', maxHeight: 'fit-content', height: 'auto' }}
    >
      {mediaTypes.map((media, index) => (
        <SwiperSlide key={index}>
          {renderMedia(media.url, media.type)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
