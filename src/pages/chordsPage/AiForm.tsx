import React, { useState } from 'react';

// 폼 데이터 타입
interface FormData {
  name: string;
  phone: string;
  address: string;
  age: string;
  gender: string;
}

// 각 필드별 에러 메시지 타입
interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  age?: string;
  gender?: string;
}

// 스타일 객체
const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  } as React.CSSProperties,
  field: {
    marginBottom: '1rem',
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
  } as React.CSSProperties,
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  button: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  } as React.CSSProperties,
};

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    address: '',
    age: '',
    gender: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 입력값 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        // 제출 후 초기화
        setFormData({
          name: '',
          phone: '',
          address: '',
          age: '',
          gender: '',
        });
        setErrors({});
      }
    } catch (error) {
      console.error('폼 제출 중 오류 발생:', error);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={styles.field}>
          <label htmlFor="name" style={styles.label}>
            이름:
          </label>
          <input
            style={styles.input}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
          />
          {errors.name && <div style={styles.error}>{errors.name}</div>}
        </div>

        <div style={styles.field}>
          <label htmlFor="phone" style={styles.label}>
            전화번호:
          </label>
          <input
            style={styles.input}
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="전화번호를 입력하세요"
          />
          {errors.phone && <div style={styles.error}>{errors.phone}</div>}
        </div>

        <div style={styles.field}>
          <label htmlFor="address" style={styles.label}>
            주소:
          </label>
          <input
            style={styles.input}
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="주소를 입력하세요"
          />
          {errors.address && <div style={styles.error}>{errors.address}</div>}
        </div>

        <div style={styles.field}>
          <label htmlFor="age" style={styles.label}>
            나이:
          </label>
          <input
            style={styles.input}
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="나이를 입력하세요"
          />
          {errors.age && <div style={styles.error}>{errors.age}</div>}
        </div>

        <div style={styles.field}>
          <label htmlFor="gender" style={styles.label}>
            성별:
          </label>
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
          {errors.gender && <div style={styles.error}>{errors.gender}</div>}
        </div>

        <button style={styles.button} type="submit">
          제출
        </button>
      </form>
    </div>
  );
};

export default UserForm;
