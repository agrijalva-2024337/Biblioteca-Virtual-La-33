import { Outlet } from 'react-router-dom';
import { DashboardContainer } from '../../shared/components/layout/DashboardContainer.jsx';

export const DashboardPage = () => {
  return (
    <div className="h-full">
      <DashboardContainer>
        <Outlet />
      </DashboardContainer>
    </div>
  );
};
