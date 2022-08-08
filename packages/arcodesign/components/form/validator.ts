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

            if (!rule || (!rule?.validator && !rule?.asyncValidator)) {
                return next();
            }
            if (rule.asyncValidator) {
                return new Promise(_resolve => {
                    rule.asyncValidator &&
                        rule.asyncValidator(value, message => {
                            if (message) {
                                errors.push(message);
                                return resolve({ errors, warnings });
                            }
                            _resolve(next());
                        });
                });
            }
            let hasNoError = true;
            rule.validator &&
                rule.validator(value, message => {
                    if (message) {
                        hasNoError = false;
                        errors.push(message);
                        return resolve({ errors, warnings });
                    }
                });
            return hasNoError && next();
        };
        validate(rules[current]);
    });
}
