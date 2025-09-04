/**
 * i18n ユーティリティ関数
 */

import { getCurrentLanguage as getLanguage } from './getLanguage';
import { switchLanguage as translatePath } from './translatePath';
import { t as translate } from './translate';
import { getLicenseTemplate, getLicenseTemplateKey, getLicenseCategory } from './license';

export { getLanguage, translatePath, translate, getLicenseTemplate, getLicenseTemplateKey, getLicenseCategory };
