import React, { FC, useContext, useRef } from 'react'
import { Switch, Select, Modal, Checkbox } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useSubscription } from 'observable-hooks'
import { DictID } from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'
import { supportedLangs } from '@/_helpers/lang-check'
import { getProfilePath } from '@/options/helpers/path-joiner'
import {
  SaladictForm,
  NUMBER_RULES,
  SaladictFormItem
} from '@/options/components/SaladictForm'
import { GlobalsContext } from '@/options/data'
import { InputNumberGroup } from '@/options/components/InputNumberGroup'
import { formItemModalLayout } from '@/options/helpers/layout'
import { uploadResult$$ } from '@/options/helpers/upload'

export interface EditModalProps {
  dictID?: DictID | null
  onClose: () => void
}

export const EditModal: FC<EditModalProps> = ({ dictID, onClose }) => {
  const { t, i18n } = useTranslate(['options', 'dicts', 'common', 'langcode'])
  const globals = useContext(GlobalsContext)
  const formRef = useRef<FormInstance>(null)
  const formItems: SaladictFormItem[] = []

  useSubscription(uploadResult$$, result => {
    // successfully saved
    if (dictID && !result.loading && !result.error) {
      onClose()
    }
  })

  if (dictID) {
    formItems.push(
      {
        key: getProfilePath('dicts', 'all', dictID, 'selectionLang'),
        label: t('dict.selectionLang'),
        help: t('dict.selectionLang_help'),
        extra: t('config.language_extra'),
        className: 'saladict-form-danger-extra',
        items: supportedLangs.map(lang => ({
          name: getProfilePath('dicts', 'all', dictID, 'selectionLang', lang),
          className: 'form-item-inline',
          valuePropName: 'checked',
          children: <Checkbox>{t(`common:lang.${lang}`)}</Checkbox>
        }))
      },
      {
        key: getProfilePath('dicts', 'all', dictID, 'defaultUnfold'),
        label: t('dict.defaultUnfold'),
        help: t('dict.defaultUnfold_help'),
        extra: t('config.language_extra'),
        className: 'saladict-form-danger-extra',
        items: supportedLangs.map(lang => ({
          name: getProfilePath('dicts', 'all', dictID, 'defaultUnfold', lang),
          className: 'form-item-inline',
          valuePropName: 'checked',
          children: <Checkbox>{t(`common:lang.${lang}`)}</Checkbox>
        }))
      },
      {
        key: getProfilePath('dicts', 'all', dictID, 'selectionWC'),
        label: t('dict.selectionWC'),
        help: t('dict.selectionWC_help'),
        items: [
          {
            name: getProfilePath('dicts', 'all', dictID, 'selectionWC', 'min'),
            label: null,
            style: { marginBottom: 5 },
            rules: NUMBER_RULES,
            children: <InputNumberGroup suffix={t('common:min')} />
          },
          {
            name: getProfilePath('dicts', 'all', dictID, 'selectionWC', 'max'),
            label: null,
            style: { marginBottom: 5 },
            rules: NUMBER_RULES,
            children: <InputNumberGroup suffix={t('common:max')} />
          }
        ]
      },
      {
        name: getProfilePath('dicts', 'all', dictID, 'preferredHeight'),
        label: t('dict.preferredHeight'),
        help: t('dict.preferredHeight_help'),
        rules: NUMBER_RULES,
        children: <InputNumberGroup suffix={t('common:max')} />
      }
    )

    // custom options
    const options = globals.profile.dicts.all[dictID]['options']
    if (options) {
      formItems.push(
        {
          key: 'dict.more_options',
          items: []
        },
        ...Object.keys(options).map(optKey => {
          // can be number | boolean | string(select)
          const value = options[optKey]

          const item: SaladictFormItem = {
            name: `profile.dicts.all.${dictID}.options.${optKey}`,
            label: t(`dicts:${dictID}.options.${optKey}`),
            help: i18n.exists(`dicts:${dictID}.helps.${optKey}`)
              ? t(`dicts:${dictID}.helps.${optKey}`)
              : null
          }

          switch (typeof value) {
            case 'number':
              item.rules = NUMBER_RULES
              item.children = (
                <InputNumberGroup
                  suffix={t(`dicts:${dictID}.options.${optKey}_unit`)}
                />
              )
              break
            case 'string':
              item.children = (
                <Select>
                  {globals.profile.dicts.all[dictID]['options_sel'][optKey].map(
                    (option: string) => (
                      <Select.Option value={option} key={option}>
                        {optKey === 'tl' || optKey === 'tl2'
                          ? t(`langcode:${option}`)
                          : t(`dicts:${dictID}.options.${optKey}-${option}`)}
                      </Select.Option>
                    )
                  )}
                </Select>
              )
              break
            default:
              item.valuePropName = 'checked'
              item.children = <Switch />
          }
          return item
        })
      )
    }
  }

  return (
    <Modal
      visible={!!dictID}
      title={t(`dicts:${dictID}.name`)}
      width={600}
      destroyOnClose
      onOk={() => {
        if (formRef.current) {
          formRef.current.submit()
        }
      }}
      onCancel={() => {
        if (globals.dirty) {
          Modal.confirm({
            title: t('unsave_confirm'),
            icon: <ExclamationCircleOutlined />,
            okType: 'danger',
            onOk: () => {
              ;(globals as GlobalsContext).dirty = false
              onClose()
            }
          })
        } else {
          onClose()
        }
      }}
    >
      {dictID && (
        <SaladictForm
          {...formItemModalLayout}
          ref={formRef}
          items={formItems}
          hideFooter
        />
      )}
    </Modal>
  )
}
