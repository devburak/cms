import { useTranslation } from "react-i18next";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import ExplicitIcon from '@mui/icons-material/Explicit';
import CategoryIcon from '@mui/icons-material/Category';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School'; // Add an icon for expertise

export function useMenuItems() {
  const { t } = useTranslation();

  const campaignsMenu = {
    id: 'campaign',
    title: t('Kampanyalar'),
    caption: t('Kampanya Yönetimi'),
    type: 'group',
    children: [
      {
        id: 'campaignPage',
        title: t('Kampanyalar'),
        type: 'collapse',
        icon: CampaignIcon, // Uygun bir ikon seçebilirsiniz
        children: [
          {
            id: 'newCampaign',
            title: t('Yeni Kampanya'),
            type: 'item',
            url: '/campaign',
            target: true,
            requiredPermission: ['createCampaign'], // İzin gereksinimi
          },
          {
            id: 'campaignList',
            title: t('Kampanya Listesi'),
            type: 'item',
            url: '/campaigns',
            target: true,
            requiredPermission: [ 'updateCampaign', 'deleteCampaign'], // İzin gereksinimi
          },
        ],
      },
    ],
  };
  

  
const dashboard = {
    id: 'dashboard',
    title: t('Dashboard'),
    type: 'group',
    children: [
      {
        id: 'default',
        title: t('Dashboard'),
        type: 'item',
        url: '/',
        icon: DashboardIcon,
        breadcrumbs: false
      },
      {
        id: 'files',
        title: t('Files'),
        type: 'item',
        url: '/files',
        icon: AttachFileIcon,
        breadcrumbs: false
      },
      {
        id: 'newCategory',
        title: t('Category'),
        type: 'item',
        url: '/category',
        icon: CategoryIcon,
        target: false
      },
    ]
  };

  const users ={
    id: 'usersgruop',
    title: t('Users'),
    caption: t('user operations'),
    type: 'group',
    children: [
      {
        id: 'usersop',
        title: t('user operations'),
        type: 'collapse',
        icon: PeopleIcon,
        children: [
          {
            id: 'user',
            title: t('New user'),
            type: 'item',
            url: '/user',
            target: true,
            requiredPermission: "createUser"
          },
          {
            id: 'users',
            title: t('Users'),
            type: 'item',
            url: '/users',
            target: true,
            requiredPermission: ["deleteUser","updateUser"]
          },
          {
            id: 'roles',
            title: t('Roles'),
            type: 'item',
            url: '/role',
            target: true ,
            requiredPermission: ["deleteRole","updateRole","readRoles", "createRole"]
          },
          {
            id: 'logs',
            title: t('Logs'),
            type: 'item',
            url: '/logs',
            target: true,
            requiredPermission: ["readLogs","deleteLog"]
          }
        ]
      }
    ]

  }

  const pages = {
    id: 'pages',
    title: t('Pages'),
    caption: t('Pages Caption'),
    type: 'group',
    children: [
      {
        id: 'staticpages',
        title: t('Pages'),
        type: 'collapse',
        icon: ArticleIcon,
        children: [
          {
            id: 'newstaticpages',
            title: t('New'),
            type: 'item',
            url: '/content',
            target: true,
            requiredPermission: ["updateContent","createContent"]
          },
          {
            id: 'allstaticpages',
            title: t('Pages'),
            type: 'item',
            url: '/allpages',
            target: true,
            requiredPermission: ["createContent","viewContent","updateContent"]
          }
        ]
      }
    ]
  };

const products = {
  id: 'product',
  title: t('Products'),
  caption: t('Product') +" "+t('Operation'),
  type: 'group',
  children: [
    {
      id: 'product',
      title: t('Products'),
      type: 'collapse',
      icon: RestaurantIcon,
      children: [
        {
          id: 'newProduct',
          title: t('New Product'),
          type: 'item',
          url: '/product',
          target: false
        },
        {
          id: 'listProduct',
          title: t('Products'),
          type: 'item',
          url: '/products',
          target: false
        }
      ]
    }
  ]

}

const events = {
  id: 'events',
  title: t('Events'),
  caption: t('Events Caption'),
  type: 'group',
  children: [
    {
      id: 'event_pages',
      title: t('Events'),
      type: 'collapse',
      icon: CalendarMonthIcon,
      children: [
        {
          id: 'newevent',
          title: t('New'),
          type: 'item',
          url: '/event',
          target: true,
          requiredPermission:["createEvent","updateEvent","deleteEvent"]
        },
        {
          id: 'eventlist',
          title: t('Events'),
          type: 'item',
          url: '/events',
          target: true,
          requiredPermission:["readEvent","updateEvent","deleteEvent"]
        }
      ]
    }
  ]
};

const settings = {
  id: 'setting',
  title: t('Settings'),
  caption: t('Settings Caption'),
  type: 'group',
  children: [
    {
      id: 'settingPage',
      title: t('Settings'),
      type: 'collapse',
      icon: SettingsSuggestIcon,
      children: [
        {
          id: 'period',
          title: t('Periods'),
          type: 'item',
          url: '/period',
          target: true,
          requiredPermission:["viewPeriods","viewPeriod","createPeriod","updatePeriod","deletePeriod"]
        },
        {
          id: 'apptoken',
          title: t('App Token'),
          type: 'item',
          url: '/apptoken',
          target: true,
          requiredPermission:["createAppToken","updateAppToken"]
        },
        {
          id: 'logs',
          title: t('Logs'),
          type: 'item',
          url: '/logs',
          target: true,
          requiredPermission:["readLogs"]
        }
      ]
    }
  ]
};

const celebration = {
  id: 'celebration',
  title: t('70. yıl içerikleri'),
  caption: t('Celebration'),
  type: 'group',
  children: [
    {
      id: 'celebrationPage',
      title: t('70. yıl'),
      type: 'collapse',
      icon: CelebrationIcon,
      children: [
        {
          id: 'newCelebrationContent',
          title: t('New'),
          type: 'item',
          url: '/celebration',
          target: true,
          requiredPermission:["createCelebration"]
        },
        {
          id: 'celebrationContents',
          title: t('List'),
          type: 'item',
          url: '/celebrations',
          target: true,
          requiredPermission:["deleteCelebration" , "updateCelebration"]
        },
        {
          id: 'periodDocument',
          title: t('New Period Documents'),
          type: 'item',
          url: '/period-document',
          target: true,
          requiredPermission:["createPeriodDocument"]
        },
        {
          id: 'periodDocuments',
          title: t('Period Documents'),
          type: 'item',
          url: '/period-documents',
          target: true,
          requiredPermission:["updatePeriodDocument","deletePeriodDocument"]
        },
        {
          id: 'periodPublication',
          title: t('Period Publication'),
          type: 'item',
          url: '/celebration-publication',
          target: true,
          requiredPermission:["createPublication","updatePublication","deletePublication"]
        }
       
      ]
    }
  ]
};

const expertiseMenu = {
  id: 'expertise',
  title: t('Bilirkişilik Eğitimleri'),
  type: 'group',
  children: [
    {
      id: 'expertisePage',
      title: t('Bilirkişilik Eğitimleri'),
      type: 'item',
      url: '/expertise',
      icon: SchoolIcon,
      target: true,
    }
  ]
};

  const formsMenu = {
    id: 'forms',
    title: t('Forms'),
    type: 'group',
    children: [
      {
        id: 'formPages',
        title: t('Forms'),
        type: 'collapse',
        icon: DynamicFormIcon,
        children: [
          {
            id: 'newForm',
            title: t('New Form'),
            type: 'item',
            url: '/form',
            target: true,
            requiredPermission: ['createForm']
          },
          {
            id: 'formList',
            title: t('Forms'),
            type: 'item',
            url: '/forms',
            target: true,
            requiredPermission: ['viewForms']
          }
        ]
      }
    ]
  };

const menuItems = {
  items: [
    dashboard,
    pages,
    users,
    events,
    formsMenu,
    expertiseMenu,
    settings,
    celebration,
    campaignsMenu,
    
  ]
}
  return menuItems;
}
