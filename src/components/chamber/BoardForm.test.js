import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BoardForm from "./BoardForm";
import {
  getAllChambers,
  getAllBoardTypes,
  getBoardTerms,
  updateBoard,
  getAllPeriods,
  createBoard,
} from "../../api";
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock("../../api", () => ({
  getAllChambers: jest.fn(),
  getAllBoardTypes: jest.fn(),
  getBoardTerms: jest.fn(),
  createBoard: jest.fn(),
  updateBoard: jest.fn(),
  getAllPeriods: jest.fn(),
}));
const chamber = { _id: "012345678901234567890123", name: "Oda" };
const type = { _id: "112345678901234567890123", name: "Yönetim" };
beforeEach(() => {
  jest.clearAllMocks();
  getAllChambers.mockResolvedValue({ data: [chamber] });
  getAllBoardTypes.mockResolvedValue([type]);
  getBoardTerms.mockResolvedValue({
    data: [{ name: "48. Dönem", datesConflicted: true }],
  });
  updateBoard.mockResolvedValue({});
});
test("editing hydrates own term without resetting it, sends only IDs and no TMMOB Period", async () => {
  const success = jest.fn();
  render(
    <BoardForm
      board={{
        _id: "b",
        name: "Oda kurulu",
        chamber,
        type,
        period: { _id: "legacy" },
        term: { name: "48. Dönem", startDate: "2026-10-23T00:00:00Z" },
        members: [{ name: "Üye", title: "Başkan" }],
      }}
      onSuccess={success}
      onError={jest.fn()}
    />,
  );
  await screen.findByText(/tarihleri farklı/);
  expect(screen.getByLabelText(/Oda dönemi/).value).toBe("48. Dönem");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Update Board" }));
  });
  await waitFor(() => expect(updateBoard).toHaveBeenCalled());
  expect(updateBoard.mock.calls[0][1]).toMatchObject({
    chamber: chamber._id,
    type: type._id,
    term: { name: "48. Dönem", startDate: "2026-10-23", endDate: null },
    members: [{ name: "Üye", title: "Başkan" }],
  });
  expect(updateBoard.mock.calls[0][1]).not.toHaveProperty("period");
  expect(getAllPeriods).not.toHaveBeenCalled();
});
test("legacy records allow member edits with no name or dates", async () => {
  render(
    <BoardForm
      board={{
        _id: "b",
        name: "Arşiv",
        chamber,
        type,
        members: [{ name: "Üye" }],
      }}
      onSuccess={jest.fn()}
      onError={jest.fn()}
    />,
  );
  await screen.findByText(/eski kayıt/);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Update Board" }));
  });
  await waitFor(() => expect(updateBoard).toHaveBeenCalled());
  expect(updateBoard.mock.calls[0][1].term).toEqual({
    name: "",
    startDate: null,
    endDate: null,
  });
});

test("new board permits optional empty period text", async () => {
  const success = jest.fn();
  const { container } = render(
    <BoardForm onSuccess={success} onError={jest.fn()} />,
  );
  await screen.findByLabelText(/Oda dönemi/);
  fireEvent.change(screen.getByLabelText(/Board Name/), {
    target: { value: "Yeni kurul" },
  });
  const typeInput = screen.getByLabelText(/Board Type/);
  fireEvent.change(typeInput, { target: { value: "Yönetim" } });
  fireEvent.click(await screen.findByRole("option", { name: "Yönetim" }));
  const chamberInput = screen.getByLabelText(/Chamber/);
  fireEvent.change(chamberInput, { target: { value: "Oda" } });
  fireEvent.click(await screen.findByRole("option", { name: "Oda" }));
  fireEvent.change(screen.getByLabelText(/Member Name/), {
    target: { value: "Üye" },
  });
  expect(screen.getByLabelText(/Oda dönemi/).required).toBe(false);
  await act(async () => {
    fireEvent.submit(container.querySelector("form"));
  });
  expect(createBoard.mock.calls[0][0].term.name).toBe("");
});
