'use client';

import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';

interface SafeIconProps extends IconBaseProps {
  icon: React.ComponentType<IconBaseProps>;
}

const SafeIcon: React.FC<SafeIconProps> = ({ icon: Icon, ...props }) => {
  try {
    if (!Icon) {
      return <FiAlertCircle {...props} />;
    }
    return <Icon {...props} />;
  } catch (error) {
    console.warn('SafeIcon: Error rendering icon', error);
    return <FiAlertCircle {...props} />;
  }
};

export default SafeIcon;