import toast from 'react-hot-toast';

const baseStyle = {
  borderRadius: '12px',
  fontWeight: 600,
  fontFamily: 'inherit',
  fontSize: '1rem',
  padding: '16px 24px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
};

export const showSuccess = (message) => {
  toast.success(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
      color: '#fff',
      border: '2px solid #22c55e',
    },
    iconTheme: { primary: '#16a34a', secondary: '#fff' },
  });
};

export const showError = (message) => {
  toast.error(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
      color: '#fff',
      border: '2px solid #ef4444',
    },
    iconTheme: { primary: '#b91c1c', secondary: '#fff' },
  });
};

export const showInfo = (message) => {
  toast(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #e8842b 0%, #c96f1f 100%)',
      color: '#fff',
      border: '2px solid #e8842b',
    },
    iconTheme: { primary: '#c96f1f', secondary: '#fff' },
  });
};
