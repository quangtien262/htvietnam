import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API } from "../../common/api";

const TaiChinh: React.FC = () => {
    // get params
    const { id } = useParams();
    // const [searchParams] = useSearchParams();
    // const status = searchParams.get("status");

    // state ....
    const [props, setProps] = useState([])
    const [loadingTable, setLoadingTable] = useState(false);
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [tableParams, setTableParams] = useState<any>({
        pagination: {
            current: 1,
            pageSize: 10,
            position: ["bottonRight"],
            total: 0,
            onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
        },
    });

    // useEffect
    function fetchData(request = {}) {
        setLoadingTable(true);
        axios.post(API.customerIndexApi, request)
            .then((res: any) => {
                const propsTmp = res.data.data
                console.log('propsTmp', propsTmp);
                // setProps(res.data.data);
            })
            .catch((err: any) => console.error(err));

    }
    useEffect(() => {
        fetchData();
    }, []);

    // search/reload
    function search(request = {}) {
        setLoadingTable(true);
        axios.post(API.customerIndexApi, request)
            .then((response: any) => {
                const res = response.data.data
                setDataSource(res.datas);
                setTableParams({
                    pagination: {
                        current: res.pageConfig.currentPage,
                        pageSize: res.pageConfig.perPage,
                        position: ["bottonRight"],
                        total: res.pageConfig.total,
                        onChange: (page: number, pageSize?: number) => setPagination({ page, pageSize }),
                    },
                });
            })
            .catch((err: any) => console.error(err));

    }

    return (
        <div>
            <h2>Thông tin người dùng ID: {id}</h2>
        </div>
    );
};

export default TaiChinh;
