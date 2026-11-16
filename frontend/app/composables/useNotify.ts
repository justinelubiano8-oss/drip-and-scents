// Global na snackbar para sa success / error messages
export const useNotify = () => {
  const notice = useState('notice', () => ({ show: false, text: '', color: 'success' }))
  const notify = (text: string, color: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    notice.value = { show: true, text, color }
  }
  return { notice, notify }
}
