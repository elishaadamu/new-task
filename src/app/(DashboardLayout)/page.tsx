import SalesOverview from "../components/dashboard/SalesOverview";
import YearlyBreakup from "../components/dashboard/YearlyBreakup";
import { Footer } from "../components/dashboard/Footer";
import ProfileWelcome from "../components/dashboard/ProfileWelcome";
import DashboardStats from "../components/dashboard/DashboardStats";
import DashboardRecentUsers from "../components/dashboard/DashboardRecentUsers";
import DashboardRecentTasks from "../components/dashboard/DashboardRecentTasks";
import DashboardRecentWallets from "../components/dashboard/DashboardRecentWallets";
import TaskStatusTable from "../components/dashboard/TaskStatusTable";

const page = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ProfileWelcome />
        </div>
        <div className="col-span-12">
          <DashboardStats />
        </div>
        <div className="lg:col-span-8 col-span-12">
          {/* <SalesOverview /> */}
          <TaskStatusTable />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <YearlyBreakup />
            </div>
          </div>
        </div>
        <div className="lg:col-span-6 col-span-12">
          <DashboardRecentUsers />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <DashboardRecentTasks />
        </div>
        <div className="col-span-12">
          <DashboardRecentWallets />
        </div>
        <div className="col-span-12">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default page;
