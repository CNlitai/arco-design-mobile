## 基础用法

#### 1

```js
import {
    Cell,
    Form,
    Input,
    Textarea,
    Switch,
    DatePicker,
    Radio,
    Button,
    Checkbox,
    Toast,
} from '@arco-design/mobile-react';
const rules = {
    name: [
        {
            validator: (val, callback) => {
                console.log('validator')
                if (!val) {
                    callback('请输入姓名');
                } else if (val.length > 40) {
                    callback('最多输入40个字');
                } else {
                    callback();
                }
            },
        },
        {
            asyncValidator: (val, callback) => {
                new Promise((_,reject)=>{
                    setTimeout(() => {
                        reject('asyncValidator error')
                    }, 1000);
                }).catch(err=>{
                    callback(err);
                })
            },
        }
    ],
    address: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请输入家庭地址');
                } else if (val.length > 100) {
                    callback('最多输入100个字');
                } else {
                    callback();
                }
            },
        },
    ],
    email: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请输入邮箱');
                } else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(val)) {
                    callback('邮箱格式不正确');
                } else if (val.length > 40) {
                    callback('最多输入40个字');
                } else {
                    callback();
                }
            },
        },
    ],
    mobile: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请输入手机号');
                } else if (!/^\d{11}$/.test(val)) {
                    callback('手机号式不正确');
                } else {
                    callback();
                }
            },
        },
    ],
    verify_code: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请输入验证码');
                } else {
                    callback();
                }
            },
        },
    ],
    identity_no: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请上传身份证');
                } else {
                    callback();
                }
            },
        },
    ],
    douyin_main_account: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请输入抖音发文账号');
                } else if (val.length > 40) {
                    callback('最多输入40个字');
                } else {
                    callback();
                }
            },
        },
    ],
    douyin_nick_name: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请输入账号昵称');
                } else if (val.length > 40) {
                    callback('最多输入40个字');
                } else {
                    callback();
                }
            },
        },
    ],
    douyin_collect_account: [
        {
            validator: (val, callback) => {
                if (!val) {
                    callback('请输入收款抖音号');
                } else if (val.length > 40) {
                    callback('最多输入40个字');
                } else {
                    callback();
                }
            },
        },
    ],
};
window.rules=rules
export default function FormDemo() {
    const inputRef = React.useRef();
    const toastRef = React.useRef();
    const [form] = Form.useForm();
    window.form = form;
    const toSubmit = val => {
        form.submit();
    };
    const onSubmit = values => {
        console.log(values, 'onSubmit');
        if (!checked) {
            return Toast.toast('请勾选同意后再进行签约');
        }

        toastRef.current = Toast.toast({
            duration: 0,
            icon: 'loading',
            loading: true,
            disableBodyTouch: true,
            content: '合同生成中，请稍后',
        });
        setTimeout(() => {
            toastRef.current.close();
        }, 1000);
    };

    const onSubmitFailed = fileds => {
        const errorMessage = fileds.find(i => i.errors && i.errors.length).errors[0];
        Toast.toast(errorMessage);
    };

    const [checked, setChecked] = React.useState(false);
    const agreementChange = () => {
        setChecked(!checked);
    };
    const [submit, setSubmit] = React.useState(false);

    const canSubmit = () => {
        const res =
            !Object.keys(form.getFieldsValue()).some(key => {
                return !form.isFieldTouched(key) || form.getFieldError(key).length;
            }) && checked;
        console.log(res);
        return res;
    };
    const onValuesChange = (changedValues, allValues) => {
        if (changedValues.mobile) {
            /^\d{11}$/.test(changedValues.mobile) ? setDisable(false) : setDisable(true);
        }
        // setTimeout(() => {
        //     setSubmit(canSubmit());
        // });
    };

    const [send, setSend] = React.useState('发送验证码');
    const [disable, setDisable] = React.useState(true);
    const handleClick = e => {
        e.preventDefault();
    };
    const SendCode = () => (
        <button
            style={{ position: 'absolute', right: 0, top: 0, fontSize: 16 }}
            disabled={disable}
            onClick={handleClick}
        >
            {send}
        </button>
    );
    React.useEffect(() => {
        // setSubmit(canSubmit());
    });
    return (
        <div>
            <Form
                form={form}
                onSubmit={onSubmit}
                onSubmitFailed={onSubmitFailed}
                onValuesChange={onValuesChange}
            >
                <Form.FormItem field="name" label="姓名" rules={rules.name} trigger="onBlur">
                    <Input placeholder="请输入姓名" clearable border="none" maxLength={3} />
                </Form.FormItem>
                <Form.FormItem field="address" label="家庭地址" rules={rules.address} trigger="onInput">
                    <Input placeholder="请输入家庭住址，详细到门牌号" clearable border="none" />
                </Form.FormItem>
                <Form.FormItem field="email" label="邮箱" rules={rules.email}>
                    <Input placeholder="请输入邮箱" clearable border="none" />
                </Form.FormItem>
                <Form.FormItem
                    field="mobile"
                    label="手机号"
                    rules={rules.mobile}
                    extra={<SendCode />}
                >
                    <Input placeholder="请输入手机号" clearable border="none" />
                </Form.FormItem>
                <Form.FormItem field="verify_code" label="验证码" rules={rules.verify_code}>
                    <Input placeholder="请输入验证码" clearable border="none" />
                </Form.FormItem>
                <Form.FormItem field="identity_no" label="身份证号" rules={rules.identity_no}>
                    <Input placeholder="上传身份证后自动识别" clearable border="none" />
                </Form.FormItem>
                <Form.FormItem
                    style={{ width: 'auto' }}
                    field="douyin_main_account[1]"
                    label="抖音发文账号"
                    rules={rules.douyin_main_account}
                >
                    <Input placeholder="请输入抖音发文账号" clearable border="none" />
                </Form.FormItem>
                <Form.FormItem
                    field="douyin_nick_name"
                    label="账号昵称"
                    rules={rules.douyin_nick_name}
                >
                    <Input placeholder="请输入账号昵称" clearable border="none" />
                </Form.FormItem>
                <Form.FormItem
                    field="douyin_collect_account"
                    label="收款抖音号"
                    rules={rules.douyin_collect_account}
                >
                    <Input placeholder="请输入收款抖音号" clearable border="none" />
                </Form.FormItem>
                <Checkbox checked={checked} onChange={agreementChange}>
                    同意且知晓<a>《个人信息保护说明》</a>
                </Checkbox>
                <Button needActive onClick={toSubmit} className={`${submit ? 'able' : 'disable'}`}>
                    Primary
                </Button>
            </Form>
        </div>
    );
}
```
