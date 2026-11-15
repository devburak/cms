import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Tabs,
  Tab,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import CategoryForm from "../components/category/categoryForm";
import CategoryList from "../components/category/categoryList";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPublicationCategories,
  createPublicationCategory,
  updatePublicationCategory,
  deletePublicationCategory,
} from "../api";
import { useAuth } from "../context/AuthContext";
import { notifyError, notifySuccess } from "../services/notificationBus";

const API = {
  content: {
    list: getCategories,
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory,
  },
  publication: {
    list: getPublicationCategories,
    create: createPublicationCategory,
    update: updatePublicationCategory,
    remove: deletePublicationCategory,
  },
};
export default function CategoryPage() {
  const { hasPermission } = useAuth();
  const [scope, setScope] = useState("content");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    API[scope]
      .list()
      .then((data) => {
        if (active) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) {
          setCategories([]);
          setError("Kategoriler yüklenemedi.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [scope, refresh]);
  const changeScope = (_, value) => {
    setScope(value);
    setCategories([]);
    setSelectedCategory(null);
    setSearch("");
    setPage(0);
  };
  const save = async (data) => {
    try {
      if (selectedCategory?._id)
        await API[scope].update(selectedCategory._id, data);
      else await API[scope].create(data);
      setSelectedCategory(null);
      setRefresh((value) => value + 1);
      notifySuccess("Kategori kaydedildi.");
    } catch (error) {
      notifyError(error?.response?.data?.message || "Kategori kaydedilemedi.");
      throw error;
    }
  };
  const remove = async (id) => {
    try {
      await API[scope].remove(id);
      setRefresh((value) => value + 1);
      setSelectedCategory(null);
      notifySuccess("Kategori kaldırıldı.");
    } catch (error) {
      notifyError(error?.response?.data?.message || "Kategori kaldırılamadı.");
    }
  };
  const visible = categories.filter((category) =>
    (category.name + " " + category.slug)
      .toLocaleLowerCase("tr-TR")
      .includes(search.toLocaleLowerCase("tr-TR")),
  );
  return (
    <Container>
      <h1>Kategoriler</h1>
      <Tabs
        value={scope}
        onChange={changeScope}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Kategori türü"
        sx={{ mb: 3 }}
      >
        <Tab
          value="content"
          label="İçerik Kategorileri"
          id="category-tab-content"
          aria-controls="category-panel-content"
        />
        <Tab
          value="publication"
          label="Yayın Kategorileri"
          id="category-tab-publication"
          aria-controls="category-panel-publication"
        />
      </Tabs>
      <Grid
        container
        spacing={2}
        role="tabpanel"
        id={"category-panel-" + scope}
        aria-labelledby={"category-tab-" + scope}
      >
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          {(selectedCategory
            ? hasPermission("updateCategory")
            : hasPermission("createCategory")) && (
            <CategoryForm
              key={scope}
              categories={categories}
              selectedCategory={selectedCategory}
              onSave={save}
              onCancel={() => setSelectedCategory(null)}
              preserveSlug={scope === "publication"}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <TextField
            size="small"
            label="Kategori ara"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          {loading ? (
            <CircularProgress aria-label="Kategoriler yükleniyor" />
          ) : (
            <CategoryList
              categories={visible}
              onEdit={
                hasPermission("updateCategory")
                  ? setSelectedCategory
                  : undefined
              }
              onDelete={remove}
              canDelete={hasPermission("deleteCategory")}
              scope={scope}
              page={Math.min(
                page,
                Math.max(0, Math.ceil(visible.length / rowsPerPage) - 1),
              )}
              rowsPerPage={rowsPerPage}
              handleChangePage={(_, value) => setPage(value)}
              handleChangeRowsPerPage={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              total={visible.length}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
