import I18n from 'automatic-i18n';

I18n.default
  .createI18nReplacer({
    targets: ['src'],
    uniqIntlKey: true,
  })
  .replace();
