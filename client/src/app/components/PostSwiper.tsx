import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';

interface PostSwiperProps {
  mediaUrls: string[];
}

export default function PostSwiper({ mediaUrls }: PostSwiperProps) {
  if (mediaUrls.length === 1) {
    return (
      <Image
        src={mediaUrls[0]}
        alt="Post media"
        layout="responsive"
        width={600}
        height={400}
        className="rounded-lg"
        objectFit="cover"
        style={{ width: '100%', height: 'auto' }}
      />
      
    );
  }

  return (
    <Swiper
      pagination={{ type: 'fraction' }}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="mySwiper"
      style={{ maxWidth: '100%', maxHeight: '400px' }}
    >
      {mediaUrls.map((url: string, index: number) => (
        <SwiperSlide key={index}>
          <Image
            src={url}
            alt={`Slide ${index + 1}`}
            layout="responsive"
            width={600}
            height={400}
            objectFit="cover"
            className="rounded-lg"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
