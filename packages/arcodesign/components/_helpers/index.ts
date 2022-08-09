/**
 * @type utils
 * @name componentUtils
 */
import { CSSProperties } from 'react';

export * from './hooks';
export * from './type';

export function getStyleWithVendor(style: CSSProperties): CSSProperties {
    const allowReg = /(transform|transition|animation)/i;
    const newStyle = Object.keys(style).reduce<CSSProperties>((acc, key) => {
        const webkitStyle = allowReg.test(key)
            ? {
                  [`Webkit${key.replace(/^(.)/, (_, p1) => p1.toUpperCase())}`]: style[key],
              }
            : {};
        return {
            ...acc,
            [key]: style[key],
            ...webkitStyle,
        };
    }, {});
    return newStyle;
}

export function setStyleWithVendor(dom: HTMLElement, cssKey: string, cssStyle: string) {
    dom.style[cssKey] = cssStyle;
    const allowReg = /(transform|transition|animation)/i;
    if (allowReg.test(cssKey)) {
        const webkitCssKey = `Webkit${cssKey.replace(
            /(\w)(\w*)/g,
            (_, $1, $2) => $1.toUpperCase() + $2,
        )}`;
        dom.style[webkitCssKey] = cssStyle;
    }
}

/**
 * 计算默认值，仅未定义时使用默认值
 * @desc {en} Calculate the default value, use default value only if undefined
 */
export const getDefaultValue = <T>(value: T | undefined, defaultValue: T): T => {
    return value === void 0 ? defaultValue : value;
};
