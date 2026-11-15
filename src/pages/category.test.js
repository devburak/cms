import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CategoryPage from "./category";
import * as api from "../api";
jest.mock("../api", () => ({
  getCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  getPublicationCategories: jest.fn(),
  createPublicationCategory: jest.fn(),
  updatePublicationCategory: jest.fn(),
  deletePublicationCategory: jest.fn(),
}));
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ hasPermission: () => true }),
}));
jest.mock("../services/notificationBus", () => ({
  notifyError: jest.fn(),
  notifySuccess: jest.fn(),
}));
jest.mock("../components/category/categoryForm", () => ({ onSave }) => (
  <button
    onClick={() => onSave({ name: "Bülten", slug: "bulten" }).catch(() => {})}
  >
    Kaydet
  </button>
));
jest.mock("../components/category/categoryList", () => ({ categories }) => (
  <div>
    {categories.map((category) => (
      <span key={category._id}>{category.name}</span>
    ))}
  </div>
));
beforeEach(() => {
  jest.clearAllMocks();
  api.getCategories.mockResolvedValue([
    { _id: "content", name: "Haberler", slug: "haberler" },
  ]);
  api.getPublicationCategories.mockResolvedValue([
    { _id: "publication", name: "Kitap", slug: "kitap" },
  ]);
  api.createPublicationCategory.mockResolvedValue({});
});
test("yayın sekmesi ayrı listeyi yükler ve yalnız yayın kategorisi servisine kaydeder", async () => {
  render(<CategoryPage />);
  expect(await screen.findByText("Haberler")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "Yayın Kategorileri" }));
  expect(await screen.findByText("Kitap")).toBeInTheDocument();
  expect(screen.queryByText("Haberler")).not.toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));
  });
  await waitFor(() =>
    expect(api.createPublicationCategory).toHaveBeenCalledWith({
      name: "Bülten",
      slug: "bulten",
    }),
  );
  expect(api.createCategory).not.toHaveBeenCalled();
});
test("sekme hızlı değişince eski içerik yanıtı yayın kategorilerini ezmez", async () => {
  let resolve;
  api.getCategories.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  render(<CategoryPage />);
  fireEvent.click(screen.getByRole("tab", { name: "Yayın Kategorileri" }));
  expect(await screen.findByText("Kitap")).toBeInTheDocument();
  await act(async () => resolve([{ _id: "old", name: "Eski içerik" }]));
  expect(screen.queryByText("Eski içerik")).not.toBeInTheDocument();
  expect(screen.getByText("Kitap")).toBeInTheDocument();
});
