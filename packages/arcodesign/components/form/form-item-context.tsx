import React from 'react';
import { IFormInstance, ILayout } from './type';
import { defaultFormDataMethods } from './useForm';

export const FormItemContext = React.createContext<{ form: IFormInstance; layout: ILayout }>({
    form: defaultFormDataMethods,
    layout: 'horizontal',
});
