import React from "react";
import { Card } from 'antd';
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const ProductList: React.FC = () => {
    const { id } = useParams();
    // const [searchParams] = useSearchParams();
    // const status = searchParams.get("status");

    return (
        <div>
            <h2>Thông tin người dùng ID: {id}</h2>
        </div>
    );
};

export default ProductList;
