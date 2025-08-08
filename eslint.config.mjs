import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // ESLint 성능 최적화 설정
    settings: {
      // 캐시 설정
      cache: true,
      cacheLocation: '.eslintcache',
      // 병렬 처리 활성화
      parallel: true,
      // 타입스크립트 파서 성능 개선
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      // 성능에 큰 영향을 주는 규칙들 조정
      'import/no-cycle': 'off', // 순환 참조 검사 비활성화 (느림)
      'import/no-unused-modules': 'off', // 사용되지 않는 모듈 검사 비활성화 (느림)
    }
  }
];

export default eslintConfig;
