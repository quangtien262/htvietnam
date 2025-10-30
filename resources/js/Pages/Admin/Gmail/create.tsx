import AdminLayout from '@/layouts/AdminLayout';

import '../../../../css/list.css';


export default function Gmail(props) {

    return (
        <AdminLayout
            auth={props.auth}
            // header={props.table.display_name}
            tables={props[1]}
            // current={null}
            content={
                <div>
                    create
                    <br/>
                </div>
            }
        />
    );
}
