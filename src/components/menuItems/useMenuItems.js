import { useTranslation } from "react-i18next";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import ExplicitIcon from '@mui/icons-material/Explicit';
import CategoryIcon from '@mui/icons-material/Category';
import RestaurantIcon from '@mui/icons-material/Restaurant';


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
      }
    ]
  };

  const sample = {
    id: 'sample',
    title: t('Sample Page'),
    type: 'group',
      children: [
          {
              id: 'sample-page',
              title: t('Sample Page'),
              type: 'item',
              url: '/sample-page',
              icon: ExplicitIcon,
              breadcrumbs: false
          },
          {
              id: 'product',
              title: t('Product Page'),
              type: 'item',
              url: '/product',
              icon: ExplicitIcon,
              breadcrumbs: false
          }
      ]
  };

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
            url: '/newpage',
            target: true
          },
          {
            id: 'allstaticpages',
            title: t('All Pages'),
            type: 'item',
            url: '/allpages',
            target: true
          }
        ]
      }
    ]
  };

const categories = {
    id: 'categories',
    title: t('Categories'),
    caption: t('Categories') +" "+t('Operation'),
    type: 'group',
    children: [
      {
        id: 'category',
        title: t('Categories'),
        type: 'collapse',
        icon: CategoryIcon,
        children: [
          {
            id: 'newCategory',
            title: t('New Category'),
            type: 'item',
            url: '/category',
            target: false
          },
          {
            id: 'listCategory',
            title: t('Categories'),
            type: 'item',
            url: '/categories',
            target: false
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
const menuItems = {
  items: [
    dashboard,
    pages,
    products,
    categories,
    sample
  ]
}
  return menuItems;
}
