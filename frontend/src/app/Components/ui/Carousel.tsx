import React from 'react';

interface PropsType {
  img: string;
}

const Carousel: React.FC<PropsType> = ({ img }) => {
  return (
    <div className="outline-none border-none relative z-10"> {/* Added z-10 to ensure carousel stays under NavBar */}
      <div className="absolute left-[30px] md:left-[70px] max-w-[250px] sm:max-w-[350px] top-50% -translate-y-50% space-y-2 lg:space-y-4 bg-[#ffffffa2] sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none"></div>
    </div>
  );
};

export default Carousel;