import React from 'react';
import { IFormInstance } from './type';
import { defaultFormDataMethods } from './useForm';

export const FormItemContextParams = React.createContext<IFormInstance>(defaultFormDataMethods);
