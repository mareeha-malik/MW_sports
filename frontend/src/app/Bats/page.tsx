// app/Bats/page.tsx
import React from 'react';
import Product_Card from '../Components/ui/Product_Card'; // Ensure the path is correct

const Bats_data = [
    { img: "/Bats.svg", Title: "Bat", desc: "High-quality willow bat for power and precision", rating: 5, price: "2000" },
    { img: "/18.svg", Title: "Bat", desc: "High-quality willow bat for power and precision", rating: 5, price: "2000" },
    { img: "/Bats.svg", Title: "Bat", desc: "High-quality willow bat for power and precision", rating: 5, price: "2000" },
    { img: "/Bats.svg", Title: "Bat", desc: "High-quality willow bat for power and precision", rating: 5, price: "2000" },
    { img: "/Bats.svg", Title: "Bat", desc: "High-quality willow bat for power and precision", rating: 5, price: "2000" },
    
];

const Bats = () => {
    return (
        <div className="container pt-16 pb-16">
            <h2 className="font-medium text-2xl pb-4">Bats</h2>
            <div className="grid grid-cols-1 place-items-center sm:place-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-x-20 xl:gap-y-10">
                {Bats_data.map((item, index) => 
                    <Product_Card
                        key={index}
                        img={item.img}
                        title={item.Title}
                        desc={item.desc}
                        rating={item.rating}
                        price={item.price} id={0}                    />
                )}
            </div>
        </div>
        
    );
};

export default Bats;
