import { ReactNode } from 'react';
import { IRules } from './type';

export function schemaValidate(
    value,
    _rules: IRules[],
): Promise<{ warnings: ReactNode[]; errors: ReactNode[] }> {
    const rules: IRules[] = [..._rules];
    let current = 0;

    return new Promise(resolve => {
        const warnings: ReactNode[] = [];
        const errors: ReactNode[] = [];
        const validate = (rule: IRules) => {
            const next = () => {
                if (current < rules.length - 1) {
                    current++;
                    return validate(rules[current]);
                }

                return resolve({ errors, warnings });
            };

            if (!rule || !rule?.validator) {
                return next();
            }

            rule.validator(value, (message?: ReactNode) => {
                if (message) {
                    // const error = {
                    //     [field]: {
                    //         message,
                    //         field,
                    //         value,
                    //     },
                    // };
                    if (rule.level === 'warning') {
                        warnings.push(message);
                    } else {
                        errors.push(message);
                        // return resolve({
                        //     error,
                        //     warning,
                        // });
                    }
                }
                return next();
            });
        };
        validate(rules[current]);
    });
}
