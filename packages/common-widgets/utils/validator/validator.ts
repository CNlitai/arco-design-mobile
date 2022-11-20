import { Promise } from 'es6-promise';
import { isArray } from '../is';
import {
    ArrayValidator,
    BaseValidator,
    CustomValidator,
    NumberValidator,
    ObjectValidator,
    StringValidator,
} from './rules';
import {
    FieldValue,
    IRules,
    ITypeRules,
    IValidateMsgTemplate,
    ValidatorError,
    ValidatorType,
} from './type';

export class Validator {
    rules: Record<string, IRules[]>;

    option: { first: boolean; validateMessage?: Partial<IValidateMsgTemplate> };

    validatorGroup: {
        number: NumberValidator;
        array: ArrayValidator;
        string: StringValidator;
        object: ObjectValidator;
        custom: CustomValidator;
    } | null;

    constructor(rules: Record<string, IRules[]>) {
        this.rules = rules;
        this.option = { first: true };
    }

    createValidatorGroup(value: any, rule: IRules, field: string) {
        return {
            number: new NumberValidator(value, rule, field),
            array: new ArrayValidator(value, rule, field),
            string: new StringValidator(value, rule, field),
            object: new ObjectValidator(value, rule, field),
            custom: new CustomValidator(value, rule, field),
        };
    }

    // 一条rule执行
    getSingleValidateGroup(value: FieldValue, rule: IRules, field: string) {
        const vType = rule?.type || 'string';
        const validPromises: Promise<any>[] = [];
        const validatorGroup = this.createValidatorGroup(value, rule, field);
        const typeValidator: BaseValidator | null =
            vType in validatorGroup ? validatorGroup[vType] : null;
        if (rule.required) {
            validPromises.push(
                new Promise(resolve => {
                    validatorGroup.number.isRequired();
                    resolve(validatorGroup.number.getErrors());
                }),
            );
        }
        if (typeValidator) {
            Object.keys(rule).map(key => {
                if (key === 'validator') {
                    const resPromise = (rule as ITypeRules<ValidatorType.Custom>).validator
                        ? validatorGroup.custom.validator(
                              (rule as ITypeRules<ValidatorType.Custom>).validator || null,
                          )
                        : null;
                    resPromise && validPromises.push(resPromise);
                    return;
                }
                validPromises.push(
                    new Promise(resolve => {
                        typeValidator.validateRules.includes(key) && typeValidator[key](rule[key]);
                        resolve(typeValidator.getErrors());
                    }),
                );
            });
        }
        return validPromises;
    }

    singleValidate(promises: Promise<any>[]) {
        let cur = 0;
        return new Promise(resolve => {
            const validate = promise => {
                const next = () => {
                    if (cur < promises.length - 1) {
                        return validate(promises[++cur]);
                    }

                    return resolve({});
                };
                promise.then((errors: ValidatorError) => {
                    if (this.option.first && (errors.message || [])?.length > 0) {
                        return resolve(errors);
                    }
                    next();
                });
            };
            validate(promises[cur]);
        });
    }

    validate(value: Record<string, any>, callback: (err) => void) {
        const promiseGroup: Promise<any>[] = [];
        const keys: string[] = [];
        if (this.rules) {
            Object.keys(this.rules).forEach(key => {
                let spPromiseGroup: Promise<any>[] = [];
                if (isArray(this.rules[key])) {
                    for (let i = 0; i < this.rules[key].length; i++) {
                        const rule = this.rules[key][i];
                        const curPromises = this.getSingleValidateGroup(value[key], rule, key);
                        spPromiseGroup = [...spPromiseGroup, ...curPromises];
                    }
                }
                if (spPromiseGroup.length) {
                    promiseGroup.push(this.singleValidate(spPromiseGroup));
                    keys.push(key);
                }
            });
        }
        if (promiseGroup.length > 0) {
            Promise.all(promiseGroup).then(data => {
                const lastErrors = data.reduce((pre, cur, index) => {
                    pre[keys[index]] = cur;
                    return pre;
                }, {});
                callback && callback(lastErrors);
            });
        } else {
            callback && callback({});
        }
    }
}
