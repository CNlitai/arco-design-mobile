/* eslint-disable react/no-unused-class-component-methods */
import React, { PureComponent, ReactNode, useContext, useRef, useState } from 'react';
import { cls } from '@arco-design/mobile-utils';
import { Validator } from '@arco-design/mobile-utils/utils/validator/validator';
import { ValidatorError } from '@arco-design/mobile-utils/utils/validator/type';
import { FormItemContext } from './form-item-context';
import { GlobalContext } from '../context-provider';
import {
    FieldError,
    FieldItem,
    FieldValue,
    IFormDataMethods,
    IFormItemInnerProps,
    IFormItemProps,
    ValidateStatus,
} from './type';

enum InternalComponentType {
    Input = 'ADMInput',
    Textarea = 'ADMTextarea',
    Checkbox = 'ADMCheckbox',
    CheckboxGroup = 'ADMCheckboxGroup',
    DatePicker = 'ADMDatePicker',
    Picker = 'ADMPicker',
    Radio = 'ADMRadio',
    RadioGroup = 'ADMRadioGroup',
    Slider = 'ADMSlider',
    Switch = 'ADMSwitch',
}

interface IFromItemInnerState {
    validateStatus: ValidateStatus;
    errors?: FieldError[];
    _touched: boolean;
}

class FormItemInner extends PureComponent<IFormItemInnerProps, IFromItemInnerState> {
    destroyField: () => void;

    private _errors: ReactNode[] = [];

    private _touched = false;

    constructor(props) {
        super(props);
        this.destroyField = () => {};
    }

    componentDidMount() {
        const { registerField } = this.context.form.getInternalHooks();
        this.destroyField = registerField(this.props.field, this);
    }

    componentWillUnmount() {
        this.destroyField();
    }

    onValueChange(preStore: FieldItem, curStore: FieldItem) {
        this._touched = true;
        const { shouldUpdate } = this.props;
        if (typeof shouldUpdate === 'function') {
            shouldUpdate({ preStore, curStore }) && this.forceUpdate();
            return;
        }
        this.forceUpdate();
    }

    getFieldError() {
        return this._errors;
    }

    isFieldTouched() {
        return this._touched;
    }

    validateField(): Promise<{
        errors: ReactNode[];
        value: FieldValue;
        field: string;
        dom: HTMLDivElement | null;
    }> {
        const { getFieldValue } = this.context.form;
        const { field, rules, onValidateStatusChange } = this.props;
        const value = getFieldValue(field);
        if (rules?.length && field) {
            const fieldDom = this.props.getFormItemRef();
            const fieldValidator = new Validator({ [field]: rules });
            return new Promise(resolve => {
                fieldValidator.validate({ [field]: value }, (errors: ValidatorError) => {
                    this._errors = errors.message || [];
                    onValidateStatusChange({
                        errors,
                        warnings: [],
                    });
                    return resolve({ errors: errors.message || [], value, field, dom: fieldDom });
                });
            });
        }
        return Promise.resolve({ errors: [], value, field, dom: null });
    }

    setFieldData(value: FieldValue) {
        const { field } = this.props;
        const { setFieldValue } = this.context.form as IFormDataMethods;
        setFieldValue(field, value);
        this.validateField();
    }

    renderChildren() {
        const { children, field, trigger = 'onChange', triggerPropsField = 'value' } = this.props;
        const { getFieldValue } = this.context.form as IFormDataMethods;
        let props = {
            [triggerPropsField]: getFieldValue(field),
        };
        switch (children.type.displayName) {
            case InternalComponentType.Input:
            case InternalComponentType.Textarea:
                props = {
                    value: getFieldValue(field) || '',
                    onInput: (_, newValue) => this.setFieldData(newValue),
                    onClear: () => this.setFieldData(''),
                };
                break;
            case InternalComponentType.Checkbox:
            case InternalComponentType.Radio:
            case InternalComponentType.Slider:
            case InternalComponentType.RadioGroup:
                props = {
                    value: getFieldValue(field),
                    onChange: newValue => this.setFieldData(newValue),
                };
                break;
            case InternalComponentType.DatePicker:
                props = {
                    currentTs: getFieldValue(field),
                    onChange: (_, newValue) => this.setFieldData(newValue),
                };
                break;
            case InternalComponentType.Picker:
                props = {
                    data: getFieldValue(field),
                    onPickerChange: (_, newValue) => this.setFieldData(newValue),
                };
                break;

            case InternalComponentType.Switch:
                props = {
                    checked: Boolean(getFieldValue(field)),
                    onChange: checked => this.setFieldData(checked),
                };
                break;
            default:
                const originTrigger = props[trigger];
                props[trigger] = (_, newValue, ...args: any) => {
                    this.setFieldData(newValue);

                    originTrigger && originTrigger(newValue, ...args);
                };
        }

        return React.cloneElement(children, props);
    }

    render() {
        return this.renderChildren();
    }
}
FormItemInner.contextType = FormItemContext;

export default function FormItem(props: IFormItemProps) {
    const {
        label,
        field,
        disabled = false,
        layout: itemLayout,
        style,
        extra,
        requiredIcon,
        ...rest
    } = props;
    const { prefixCls } = useContext(GlobalContext);
    const { layout } = useContext(FormItemContext);
    const [errors, setErrors] = useState<ReactNode | null>(null);
    const [warnings, setWarnings] = useState<ReactNode[]>([]);
    const formItemRef = useRef<HTMLDivElement | null>(null);

    const onValidateStatusChange = (validateResult: {
        errors: ReactNode[];
        warnings: ReactNode[];
    }) => {
        const { errors: _errors, warnings: _warnings } = validateResult;
        setErrors(_errors.length ? _errors[0] : null);
        setWarnings(_warnings);
    };
    const getFormItemRef = () => {
        return formItemRef.current;
    };

    return (
        <div
            className={cls(
                `${prefixCls}-form-item`,
                `${prefixCls}-form-item-${itemLayout || layout}`,
                {
                    disabled,
                },
            )}
            style={style}
            ref={formItemRef}
        >
            <div className={cls(`${prefixCls}-form-label-item`)}>
                {rest.required
                    ? requiredIcon || (
                          <span className={cls(`${prefixCls}-form-label-item-required-tip`)}>
                              *
                          </span>
                      )
                    : null}
                {label}
            </div>
            <div className={cls(`${prefixCls}-form-item-control-wrapper`)}>
                <div className={cls(`${prefixCls}-form-item-control`)}>
                    <FormItemInner
                        {...rest}
                        field={field}
                        onValidateStatusChange={onValidateStatusChange}
                        getFormItemRef={getFormItemRef}
                    />
                </div>
                {errors && (
                    <div className={cls(`${prefixCls}-form-message`)}>
                        {errors}
                        {warnings.map((warning, index) => (
                            <p key={index}>{warning}</p>
                        ))}
                    </div>
                )}
            </div>
            {extra}
        </div>
    );
}
