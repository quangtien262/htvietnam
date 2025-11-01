import React from "react";
import { Card } from 'antd';
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { ROUTE } from "../../common/route";

const DashboardAitilen: React.FC = () => {
    // const { id } = useParams();
    // const [searchParams] = useSearchParams();
    // const status = searchParams.get("status");
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    if(!p) {
        // redirect to home
        window.location.href = ROUTE.dashboard;
    }

    return (
        <div>
            <h2>Dashboard</h2>
        </div>
    );
};

export default DashboardAitilen;
