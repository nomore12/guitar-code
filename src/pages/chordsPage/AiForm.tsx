import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Form from '@radix-ui/react-form';

interface FormData {
  name: string;
  phone: string;
  address: string;
  age: number;
  gender: string;
}

const schema = yup.object().shape({
  name: yup.string().required('이름을 입력해주세요.'),
  phone: yup
    .string()
    .matches(/^\d{3}-\d{3,4}-\d{4}$/, '유효한 전화번호를 입력해주세요.')
    .required('전화번호를 입력해주세요.'),
  address: yup.string().required('주소를 입력해주세요.'),
  age: yup
    .number()
    .positive('유효한 나이를 입력해주세요.')
    .integer('유효한 나이를 입력해주세요.')
    .required('나이를 입력해주세요.'),
  gender: yup
    .string()
    .oneOf(['male', 'female'], '성별을 선택해주세요.')
    .required('성별을 선택해주세요.'),
});

const AiForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form.Root onSubmit={handleSubmit(onSubmit)}>
      <Form.Field name="name">
        <Form.Label>이름</Form.Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Form.Input {...field} />}
        />
        {errors.name && <Form.Message>{errors.name.message}</Form.Message>}
      </Form.Field>

      <Form.Field name="phone">
        <Form.Label>전화번호</Form.Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => <Form.Input {...field} />}
        />
        {errors.phone && <Form.Message>{errors.phone.message}</Form.Message>}
      </Form.Field>

      <Form.Field name="address">
        <Form.Label>주소</Form.Label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => <Form.Input {...field} />}
        />
        {errors.address && (
          <Form.Message>{errors.address.message}</Form.Message>
        )}
      </Form.Field>

      <Form.Field name="age">
        <Form.Label>나이</Form.Label>
        <Controller
          name="age"
          control={control}
          render={({ field }) => <Form.Input type="number" {...field} />}
        />
        {errors.age && <Form.Message>{errors.age.message}</Form.Message>}
      </Form.Field>

      <Form.Field name="gender">
        <Form.Label>성별</Form.Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Form.Select {...field}>
              <option value="">선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </Form.Select>
          )}
        />
        {errors.gender && <Form.Message>{errors.gender.message}</Form.Message>}
      </Form.Field>

      <Form.Submit>제출</Form.Submit>
    </Form.Root>
  );
};

export default AiForm;
