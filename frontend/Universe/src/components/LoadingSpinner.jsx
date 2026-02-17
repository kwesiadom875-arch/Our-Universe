// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 40, color = "#D4A373" }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <motion.div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: `4px solid #eee`,
                    borderTop: `4px solid ${color}`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                role="status"
                aria-label="Loading"
            />
        </div>
    );
};

export default LoadingSpinner;
