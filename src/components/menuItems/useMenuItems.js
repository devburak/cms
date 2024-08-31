import { useTranslation } from "react-i18next";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import ExplicitIcon from '@mui/icons-material/Explicit';
import CategoryIcon from '@mui/icons-material/Category';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

export function useMenuItems() {
  const { t } = useTranslation();

  
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
            target: true
          },
          {
            id: 'users',
            title: t('Users'),
            type: 'item',
            url: '/users',
            target: true
          },
          {
            id: 'roles',
            title: t('Roles'),
            type: 'item',
            url: '/role',
            target: true
          },
          {
            id: 'logs',
            title: t('Logs'),
            type: 'item',
            url: '/logs',
            target: true
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
            target: true
          },
          {
            id: 'allstaticpages',
            title: t('Pages'),
            type: 'item',
            url: '/allpages',
            target: true
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
          target: true
        },
        {
          id: 'eventlist',
          title: t('Events'),
          type: 'item',
          url: '/events',
          target: true
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
          id: 'apptoken',
          title: t('App Token'),
          type: 'item',
          url: '/apptoken',
          target: true
        },
        {
          id: 'logs',
          title: t('Logs'),
          type: 'item',
          url: '/logs',
          target: true
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
    settings
  ]
}
  return menuItems;
}
