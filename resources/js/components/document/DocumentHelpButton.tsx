import React from 'react';
import { FloatButton } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ROUTE from '../../common/route';

/**
 * Component FloatButton hiển thị nút Help nổi góc phải màn hình
 * Click vào sẽ chuyển đến trang User Guide
 */
const DocumentHelpButton: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(ROUTE.documentsUserGuide);
    };

    return (
        <FloatButton
            icon={<QuestionCircleOutlined />}
            type="primary"
            tooltip="Hướng dẫn sử dụng"
            onClick={handleClick}
            style={{ right: 24, bottom: 24 }}
        />
    );
};

export default DocumentHelpButton;
