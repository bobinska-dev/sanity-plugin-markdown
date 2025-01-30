import {type Options as EasyMdeOptions} from 'easymde'
import {lazy, Suspense, useCallback, useMemo, useSyncExternalStore} from 'react'
// dont import non-types here, it will break SSR on next
import {Box, Text} from '@sanity/ui'
import type {SimpleMDEReactProps} from 'react-simplemde-editor'
import {PatchEvent, set, StringInputProps, unset, useClient} from 'sanity'
import {MarkdownOptions} from '../schema'
import {MarkdownInputStyles} from './MarkdownInputStyles'

const SimpleMdeReact = lazy(() => import('react-simplemde-editor'))

export interface MarkdownInputProps extends StringInputProps {
  /**
   * These are passed along directly to
   *
   * Note: MarkdownInput sets certain reactMdeProps.options by default.
   * These will be merged with any custom options.
   */
  reactMdeProps?: Omit<SimpleMDEReactProps, 'value' | 'onChange'>
}

export const defaultMdeTools: EasyMdeOptions['toolbar'] = [
  'heading',
  'bold',
  'italic',
  '|',
  'quote',
  'unordered-list',
  'ordered-list',
  '|',
  'link',
  'image',
  'code',
  '|',
  'preview',
  'side-by-side',
]

export function MarkdownInput(props: MarkdownInputProps) {
  const {
    value = '',
    onChange,
    elementProps: {onBlur, onFocus, ref},
    reactMdeProps: {options: mdeCustomOptions, textareaProps, ...reactMdeProps} = {},
    schemaType,
    readOnly,
  } = props
  const client = useClient({apiVersion: '2022-01-01'})
  const {imageUrl} = (schemaType.options as MarkdownOptions | undefined) ?? {}

  const imageUpload = useCallback(
    (file: File, onSuccess: (url: string) => void, onError: (error: string) => void) => {
      client.assets
        .upload('image', file)
        .then((doc) => onSuccess(imageUrl ? imageUrl(doc) : `${doc.url}?w=450`))
        .catch((e) => {
          console.error(e)
          onError(e.message)
        })
    },
    [client, imageUrl],
  )

  const mdeProps: SimpleMDEReactProps = useMemo(() => {
    return {
      textareaProps: {
        disabled: readOnly,
        ...textareaProps,
      },
      options: {
        autofocus: false,
        spellChecker: false,
        sideBySideFullscreen: false,
        uploadImage: true,
        imageUploadFunction: imageUpload,
        toolbar: defaultMdeTools,
        status: false,
        ...mdeCustomOptions,
      },
    }
  }, [imageUpload, mdeCustomOptions, textareaProps, readOnly])

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(PatchEvent.from(newValue ? set(newValue) : unset()))
    },
    [onChange],
  )

  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )

  if (!mounted) {
    return <MarkdownInputStyles>{fallback}</MarkdownInputStyles>
  }

  return (
    <MarkdownInputStyles>
      <Suspense fallback={fallback}>
        <SimpleMdeReact
          {...reactMdeProps}
          textareaProps={mdeProps.textareaProps}
          ref={ref}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          options={mdeProps.options}
          spellCheck={false}
        />
      </Suspense>
    </MarkdownInputStyles>
  )
}

// eslint-disable-next-line no-empty-function
const noop = () => () => {}

const fallback = (
  <Box padding={3}>
    <Text>Loading editor...</Text>
  </Box>
)
