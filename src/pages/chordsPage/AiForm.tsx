import React, { useReducer, useCallback } from 'react';

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

interface FormState {
  data: FormData;
  errors: FormErrors;
}

const initialState: FormState = {
  data: {
    name: '',
    phone: '',
    address: '',
    age: '',
    gender: '',
  },
  errors: {},
};

// 2. 액션 타입 및 리듀서
type FormAction =
  | { type: 'SET_FIELD'; payload: { field: keyof FormData; value: string } }
  | { type: 'SET_ERRORS'; payload: FormErrors }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.payload.field]: action.payload.value },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// 3. 인라인 스타일 객체
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

// 4. 재사용 가능한 FormField 컴포넌트
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

// 5. 필드 구성 배열 (확장 및 수정이 용이)
interface FieldDefinition {
  id: keyof FormData;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const fields: FieldDefinition[] = [
  {
    id: 'name',
    label: '이름:',
    type: 'text',
    placeholder: '이름을 입력하세요',
  },
  {
    id: 'phone',
    label: '전화번호:',
    type: 'text',
    placeholder: '전화번호를 입력하세요',
  },
  {
    id: 'address',
    label: '주소:',
    type: 'text',
    placeholder: '주소를 입력하세요',
  },
  {
    id: 'age',
    label: '나이:',
    type: 'number',
    placeholder: '나이를 입력하세요',
  },
  {
    id: 'gender',
    label: '성별:',
    type: 'select',
    options: [
      { value: '', label: '선택하세요' },
      { value: 'male', label: '남성' },
      { value: 'female', label: '여성' },
      { value: 'other', label: '기타' },
    ],
  },
];

// 6. 검증 로직을 분리하여 별도 함수로 정의
const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};
  if (!data.name.trim()) {
    errors.name = '이름은 필수입니다.';
  }
  if (!data.phone.trim()) {
    errors.phone = '전화번호는 필수입니다.';
  } else if (!/^\d+$/.test(data.phone)) {
    errors.phone = '전화번호는 숫자만 포함해야 합니다.';
  }
  if (!data.address.trim()) {
    errors.address = '주소는 필수입니다.';
  }
  if (!data.age.trim()) {
    errors.age = '나이는 필수입니다.';
  } else {
    const ageNum = Number(data.age);
    if (isNaN(ageNum) || ageNum <= 0) {
      errors.age = '유효한 나이를 입력해주세요.';
    }
  }
  if (!data.gender.trim()) {
    errors.gender = '성별을 선택해주세요.';
  }
  return errors;
};

// 7. 메인 컴포넌트: UserForm
const UserForm: React.FC = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // 입력값 변경 핸들러 (useCallback 적용)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      dispatch({
        type: 'SET_FIELD',
        payload: { field: name as keyof FormData, value },
      });
    },
    [],
  );

  // 폼 제출 핸들러 (검증 후 성공 시 RESET)
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const errors = validateForm(state.data);
      dispatch({ type: 'SET_ERRORS', payload: errors });
      if (Object.keys(errors).length === 0) {
        console.log('제출된 데이터:', state.data);
        alert('폼 제출 성공!');
        dispatch({ type: 'RESET' });
      }
    },
    [state.data],
  );

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} noValidate>
        {fields.map((field) => (
          <FormField
            key={field.id}
            id={field.id}
            label={field.label}
            error={state.errors[field.id]}
          >
            {field.type === 'select' ? (
              <select
                style={styles.input}
                id={field.id}
                name={field.id}
                value={state.data[field.id]}
                onChange={handleChange}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                style={styles.input}
                type={field.type}
                id={field.id}
                name={field.id}
                value={state.data[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
              />
            )}
          </FormField>
        ))}
        <button style={styles.button} type="submit">
          제출
        </button>
      </form>
    </div>
  );
};

export default UserForm;
