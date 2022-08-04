import React, { useRef, forwardRef, Ref, useImperativeHandle, ReactNode } from 'react';
import { ContextLayout } from '../context-provider';
import FormItem from './formItem';
import { FormItemContextParams } from './formItemContext';
import { Callbacks, FieldItem, IFormInstance, InternalFormInstance } from './type';
import useForm from './useForm';

export interface FormProps {
    /** 自定义类名 */
    className?: string;
    /** 自定义样式 */
    style?: React.CSSProperties;
    form?: IFormInstance;
    initialValues?: FieldItem;
    children: React.ReactNodeArray | ReactNode;
    onValuesChange?: Callbacks['onValuesChange'];
    onSubmit?: Callbacks['onSubmit'];
    onSubmitFailed?: Callbacks['onSubmitFailed'];
}

export interface FormRef {
    /** 最外层元素 DOM */
    dom: HTMLFormElement | null;
}

/**
 * 表单组件用于集合数据录入
 * @en Form
 * @type 数据录入
 * @type_en Data Entry
 * @name 表单
 * @name_en Form
 */
const Form = forwardRef((props: FormProps, ref: Ref<FormRef>) => {
    const {
        className = '',
        style,
        initialValues,
        form: formInstance,
        children,
        onValuesChange,
        onSubmit,
        onSubmitFailed,
    } = props;
    const domRef = useRef<HTMLFormElement | null>(null);
    const [form] = useForm(formInstance);
    const { setCallbacks, setInitialValues } = (form as InternalFormInstance).getInternalHooks();
    setCallbacks({
        onValuesChange,
        onSubmit,
        onSubmitFailed,
    });

    const mountRef = React.useRef<boolean>(true);
    setInitialValues(initialValues || {}, !mountRef.current);
    if (!mountRef.current) {
        mountRef.current = false;
    }
    useImperativeHandle(ref, () => ({
        dom: domRef.current,
    }));

    return (
        <ContextLayout>
            {({ prefixCls }) => (
                <form
                    className={`${prefixCls}-form ${className}`}
                    style={style}
                    ref={domRef}
                    onSubmit={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.submit();
                    }}
                >
                    <FormItemContextParams.Provider value={form}>
                        {children}
                    </FormItemContextParams.Provider>
                </form>
            )}
        </ContextLayout>
    );
});

(Form as any).FormItem = FormItem;
(Form as any).useForm = useForm;
export { FormItem, useForm };
export default Form;
