// app/Bats/page.tsx
import React from 'react';
import Product_Card from '../Components/ui/Product_Card'; // Ensure the path is correct
import Hero from '../Components/ui/Hero';
const Bats_data = [
    {img: "/Bag_1.svg", Title: "Gears", desc: "Spacious bag with compartments for all your gear", rating: 4, price: "2300" },
    {img: "/Bag_2.svg", Title: "Gears", desc: "Spacious bag with compartments for all your gear", rating: 5, price: "2500" },
    {img: "/Bag_3.svg", Title: "Gears", desc: "Spacious bag with compartments for all your gear", rating: 4, price: "3000" },
    {img: "/Bag_3.svg", Title: "Gears", desc: "Spacious bag with compartments for all your gear", rating: 5, price: "2200" },

];

const Bats = () => {
    return (
        <div>
<Hero/>
        <div className="container pt-16">
            <h2 className="font-medium text-2xl pb-4">Gears</h2>
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
        </div>
    );
};

export default Bats;
