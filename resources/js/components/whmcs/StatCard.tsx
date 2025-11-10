import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
    title: string;
    value: number | string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    precision?: number;
    trend?: 'up' | 'down';
    trendValue?: number;
    loading?: boolean;
    valueStyle?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    prefix,
    suffix,
    precision = 0,
    trend,
    trendValue,
    loading = false,
    valueStyle = {},
}) => {
    const getTrendIcon = () => {
        if (!trend) return null;
        return trend === 'up' ? (
            <ArrowUpOutlined style={{ color: '#3f8600' }} />
        ) : (
            <ArrowDownOutlined style={{ color: '#cf1322' }} />
        );
    };

    const getTrendColor = () => {
        if (!trend) return undefined;
        return trend === 'up' ? '#3f8600' : '#cf1322';
    };

    return (
        <Card loading={loading} hoverable>
            <Statistic
                title={title}
                value={value}
                precision={precision}
                prefix={prefix}
                suffix={suffix}
                valueStyle={{ ...valueStyle }}
            />
            {trend && trendValue !== undefined && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                    {getTrendIcon()}{' '}
                    <span style={{ color: getTrendColor() }}>
                        {trendValue}%
                    </span>{' '}
                    <span style={{ color: '#999' }}>so với kỳ trước</span>
                </div>
            )}
        </Card>
    );
};

export default StatCard;
