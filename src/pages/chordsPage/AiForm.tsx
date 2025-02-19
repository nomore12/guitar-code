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

// 3. 재사용 가능한 FormField 컴포넌트
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

// 4. 리듀서 및 액션 정의
type FormAction =
  | { type: 'SET_FIELD'; payload: { field: keyof FormData; value: string } }
  | { type: 'SET_ERRORS'; payload: FormErrors }
  | { type: 'RESET' };

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

// 5. 메인 컴포넌트: UserForm
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

  // 유효성 검사 함수 (useCallback 적용)
  const validate = useCallback((): boolean => {
    const { name, phone, address, age, gender } = state.data;
    const errors: FormErrors = {};

    if (!name.trim()) {
      errors.name = '이름은 필수입니다.';
    }
    if (!phone.trim()) {
      errors.phone = '전화번호는 필수입니다.';
    } else if (!/^\d+$/.test(phone)) {
      errors.phone = '전화번호는 숫자만 포함해야 합니다.';
    }
    if (!address.trim()) {
      errors.address = '주소는 필수입니다.';
    }
    if (!age.trim()) {
      errors.age = '나이는 필수입니다.';
    } else {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum <= 0) {
        errors.age = '유효한 나이를 입력해주세요.';
      }
    }
    if (!gender.trim()) {
      errors.gender = '성별을 선택해주세요.';
    }

    dispatch({ type: 'SET_ERRORS', payload: errors });
    return Object.keys(errors).length === 0;
  }, [state.data]);

  // 폼 제출 핸들러 (useCallback 적용)
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validate()) {
        console.log('제출된 데이터:', state.data);
        alert('폼 제출 성공!');
        dispatch({ type: 'RESET' });
      }
    },
    [validate, state.data],
  );

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="name" label="이름:" error={state.errors.name}>
          <input
            style={styles.input}
            type="text"
            id="name"
            name="name"
            value={state.data.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
          />
        </FormField>

        <FormField id="phone" label="전화번호:" error={state.errors.phone}>
          <input
            style={styles.input}
            type="text"
            id="phone"
            name="phone"
            value={state.data.phone}
            onChange={handleChange}
            placeholder="전화번호를 입력하세요"
          />
        </FormField>

        <FormField id="address" label="주소:" error={state.errors.address}>
          <input
            style={styles.input}
            type="text"
            id="address"
            name="address"
            value={state.data.address}
            onChange={handleChange}
            placeholder="주소를 입력하세요"
          />
        </FormField>

        <FormField id="age" label="나이:" error={state.errors.age}>
          <input
            style={styles.input}
            type="number"
            id="age"
            name="age"
            value={state.data.age}
            onChange={handleChange}
            placeholder="나이를 입력하세요"
          />
        </FormField>

        <FormField id="gender" label="성별:" error={state.errors.gender}>
          <select
            style={styles.input}
            id="gender"
            name="gender"
            value={state.data.gender}
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
