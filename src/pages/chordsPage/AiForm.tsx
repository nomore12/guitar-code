import React, { useState } from 'react';

// 1. 타입 정의
interface FormData {
  name: string;
  phone: string;
  address: string;
  age: string;
  gender: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  age?: string;
  gender?: string;
}

// 2. 인라인 스타일 객체
const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
  } as React.CSSProperties,
  field: {
    marginBottom: '1.25rem',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
  } as React.CSSProperties,
  error: {
    color: 'red',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  button: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '100%',
  } as React.CSSProperties,
};

// 3. FormField 컴포넌트 (재사용 가능한 입력 필드 래퍼)
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  children,
}) => (
  <div style={styles.field}>
    <label htmlFor={id} style={styles.label}>
      {label}
    </label>
    {children}
    {error && <div style={styles.error}>{error}</div>}
  </div>
);

// 4. 커스텀 훅: 폼 상태 및 에러 관리
const useForm = (initialState: FormData) => {
  const [data, setData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setData(initialState);
    setErrors({});
  };

  return { data, errors, setErrors, handleChange, resetForm };
};

// 5. 메인 컴포넌트: UserForm
const UserForm: React.FC = () => {
  const initialState: FormData = {
    name: '',
    phone: '',
    address: '',
    age: '',
    gender: '',
  };

  const {
    data: formData,
    errors,
    setErrors,
    handleChange,
    resetForm,
  } = useForm(initialState);

  // 유효성 검사 함수
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호는 필수입니다.';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = '전화번호는 숫자만 포함해야 합니다.';
    }
    if (!formData.address.trim()) {
      newErrors.address = '주소는 필수입니다.';
    }
    if (!formData.age.trim()) {
      newErrors.age = '나이는 필수입니다.';
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum <= 0) {
        newErrors.age = '유효한 나이를 입력해주세요.';
      }
    }
    if (!formData.gender.trim()) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (validate()) {
        console.log('제출된 데이터:', formData);
        alert('폼 제출 성공!');
        resetForm();
      }
    } catch (error) {
      console.error('폼 제출 중 오류 발생:', error);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="name" label="이름:" error={errors.name}>
          <input
            style={styles.input}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
          />
        </FormField>

        <FormField id="phone" label="전화번호:" error={errors.phone}>
          <input
            style={styles.input}
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="전화번호를 입력하세요"
          />
        </FormField>

        <FormField id="address" label="주소:" error={errors.address}>
          <input
            style={styles.input}
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="주소를 입력하세요"
          />
        </FormField>

        <FormField id="age" label="나이:" error={errors.age}>
          <input
            style={styles.input}
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="나이를 입력하세요"
          />
        </FormField>

        <FormField id="gender" label="성별:" error={errors.gender}>
          <select
            style={styles.input}
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">선택하세요</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </FormField>

        <button style={styles.button} type="submit">
          제출
        </button>
      </form>
    </div>
  );
};

export default UserForm;
