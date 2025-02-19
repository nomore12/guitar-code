import React, { useState } from 'react';

// 폼에 사용할 데이터 타입 정의
interface FormData {
  name: string;
  phone: string;
  address: string;
  age: string; // input에서 받는 값은 string이므로 string으로 관리하고, 제출 시 변환합니다.
  gender: string;
}

// 에러 메시지 타입 (각 필드에 선택적으로 에러 메시지가 존재)
interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  age?: string;
  gender?: string;
}

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    address: '',
    age: '',
    gender: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 입력 필드 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 유효성 검사 함수
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // 이름 필수 검사
    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다.';
    }

    // 전화번호 필수 및 숫자만 포함 검사
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호는 필수입니다.';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = '전화번호는 숫자만 포함해야 합니다.';
    }

    // 주소 필수 검사
    if (!formData.address.trim()) {
      newErrors.address = '주소는 필수입니다.';
    }

    // 나이 필수 및 유효한 숫자 검사
    if (!formData.age.trim()) {
      newErrors.age = '나이는 필수입니다.';
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum <= 0) {
        newErrors.age = '유효한 나이를 입력해주세요.';
      }
    }

    // 성별 필수 검사
    if (!formData.gender.trim()) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    setErrors(newErrors);

    // 에러가 없으면 true 반환
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (validate()) {
        // 유효성 검사를 통과한 경우 폼 데이터 사용 (예: 서버 전송)
        console.log('제출된 데이터:', formData);

        // 폼 전송 후 초기화
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
      // 예기치 못한 오류에 대한 핸들링
      console.error('폼 제출 중 오류 발생:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          이름:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
        {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
      </div>

      <div>
        <label>
          전화번호:
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </label>
        {errors.phone && <span style={{ color: 'red' }}>{errors.phone}</span>}
      </div>

      <div>
        <label>
          주소:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>
        {errors.address && (
          <span style={{ color: 'red' }}>{errors.address}</span>
        )}
      </div>

      <div>
        <label>
          나이:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </label>
        {errors.age && <span style={{ color: 'red' }}>{errors.age}</span>}
      </div>

      <div>
        <label>
          성별:
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">선택하세요</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </label>
        {errors.gender && <span style={{ color: 'red' }}>{errors.gender}</span>}
      </div>

      <button type="submit">제출</button>
    </form>
  );
};

export default UserForm;
