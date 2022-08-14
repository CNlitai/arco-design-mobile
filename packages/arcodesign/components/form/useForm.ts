/* eslint-disable no-console */
import { ReactNode, useRef } from 'react';
import { Callbacks, FieldError, FieldItem, IFormInstance } from './type';

const defaultFunc: any = () => {
    console.log('arco');
};
export const defaultFormDataMethods = {
    getFieldValue: name => name,
    getFieldsValue: names => {
        console.log(names);
        return { arco: 'arco' };
    },
    setFieldValue: (name, value) => {
        console.log(name, value);
        return true;
    },
    setFieldsValue: values => {
        console.log(values);
        return true;
    },
    registerField: (name, self) => {
        console.log(name, self);
        return () => {};
    },
    resetFields: defaultFunc,
    validateFields: defaultFunc,
    submit: defaultFunc,

    getInternalHooks: () => {
        defaultFunc();

        return {
            registerField: defaultFunc,
            setInitialValues: defaultFunc,
            setCallbacks: defaultFunc,
        };
    },
};

// 在field的静态的状态下设置
class FormData {
    private _formData: FieldItem = {}; // 数据源

    private _fieldsList = {}; // 字段列表

    private _initialValues: Record<string, unknown> = {}; // 初始值

    private _callbacks: Callbacks = {};

    setFieldsValue = (values: FieldItem): boolean => {
        this._formData = { ...this._formData, ...values };
        this.notifyField(values);
        Object.keys(values).forEach(key => {
            if (key in this._fieldsList) {
                this._fieldsList[key]?.onValueChange();
            }
        });
        return true;
    };

    setFieldValue = (name: string, value: unknown): boolean => {
        this._formData = { ...this._formData, [name]: value };
        const { onValuesChange } = this._callbacks;
        onValuesChange &&
            onValuesChange(
                {
                    [name]: value,
                },
                this._formData,
            );
        this.notifyField({ [name]: value });
        return true;
    };

    notifyField = (values: FieldItem): void => {
        Object.keys(values).map((fieldName: string) => {
            const fieldObj = this._fieldsList?.[fieldName] || null;
            if (fieldObj) {
                fieldObj.onValueChange(values[fieldName]);
            }
        });
    };

    getFieldsValue = (names?: string[]) => {
        if (names) {
            return names.map(name => this.getFieldValue(name));
        }
        return this._formData;
    };

    getFieldValue = (name: string) => {
        return this._formData?.[name];
    };

    getFieldError = (name: string) => {
        const field = this._fieldsList?.[name] || null;
        if (field) {
            return field.getFieldError();
        }
        return {
            name,
            errors: [],
            warnings: [],
        };
    };

    isFieldTouched = (name: string): boolean => {
        const field = this._fieldsList?.[name] || null;
        if (field) {
            return field.isFieldTouched();
        }
        return false;
    };

    registerField = (name: string, self: ReactNode) => {
        this._fieldsList[name] = self;
        const { initialValue } = (self as any).props;
        if (initialValue !== undefined && name) {
            this._initialValues = {
                ...this._initialValues,
                [name]: initialValue,
            };
            this.setFieldsValue({
                ...this._formData,
                [name]: initialValue,
            });
        }

        return () => {
            if (name in this._fieldsList) {
                delete this._fieldsList[name];
                delete this._formData[name];
            }
        };
    };

    setInitialValues = (initVal: Record<string, unknown>, firstSet: boolean) => {
        if (firstSet) return;
        this._initialValues = { ...(initVal || {}) };
        this.setFieldsValue(initVal);
    };

    resetFields = () => {
        this.setFieldsValue(this._initialValues);
    };

    validateFields = () => {
        const promiseList: Promise<{
            field: string;
            value: any;
            errors: ReactNode[];
        }>[] = [];
        Object.values(this._fieldsList).forEach((entity: any) => {
            const promise = entity.validateField();
            promiseList.push(promise.then(errors => errors));
        });

        let hasError = false;
        let count = promiseList.length;
        const results: FieldError[] = [];
        const summaryPromise = new Promise((resolve, reject) => {
            promiseList.forEach(promise => {
                promise.then(result => {
                    if (result?.errors?.length) {
                        results.push(result);
                        hasError = true;
                    }
                    count -= 1;
                    if (count > 0) {
                        return;
                    }
                    if (hasError) {
                        reject(results);
                    }
                    resolve(results);
                });
            });
        });

        return summaryPromise as Promise<Record<string, any>>;
    };

    submit = async () => {
        this.validateFields()
            .then(values => {
                const { onSubmit } = this._callbacks;
                if (onSubmit) {
                    try {
                        onSubmit(values);
                    } catch (err) {
                        console.error(err);
                    }
                }
            })
            .catch(e => {
                const { onSubmitFailed } = this._callbacks;
                if (onSubmitFailed) {
                    onSubmitFailed(e);
                }
            });
    };

    setCallbacks = (callbacks: Callbacks) => {
        this._callbacks = callbacks;
    };

    getMethods = () => {
        return {
            setFieldsValue: this.setFieldsValue,
            setFieldValue: this.setFieldValue,
            getFieldsValue: this.getFieldsValue,
            getFieldValue: this.getFieldValue,
            getFieldError: this.getFieldError,
            isFieldTouched: this.isFieldTouched,
            registerField: this.registerField,
            resetFields: this.resetFields,
            submit: this.submit,
            getInternalHooks: this.getInternalHooks,
            validateFields: this.validateFields,
        };
    };

    getInternalHooks = () => {
        return {
            registerField: this.registerField,
            setInitialValues: this.setInitialValues,
            setCallbacks: this.setCallbacks,
        };
    };
}

export default function useForm(form?: IFormInstance) {
    const formInstanceRef = useRef<IFormInstance>(defaultFormDataMethods);
    const isSingletonRef = useRef<boolean>(false);
    if (!isSingletonRef.current) {
        if (form) {
            formInstanceRef.current = form;
        } else {
            const formIns = new FormData();
            formInstanceRef.current = formIns.getMethods();
        }
        isSingletonRef.current = true;
    }
    return [formInstanceRef.current];
}
