import GridCellToolTip from "../../GridCellToolTip";


export const _codesColumn = [
  {
    field: "code",
    headerName: "Code",
    width: "500",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "approved",
    headerName: "Approved/UnApproved",
    renderCell: cellValues => {
      return <div style={{ width: "100%", textAlign: "center", cursor: "pointer" }}>{cellValues.value}</div>;
    }
  },
  {
    field: "rejected",
    headerName: "Reject",
    renderCell: cellValues => {
      return <div style={{ width: "100%", textAlign: "center", cursor: "pointer" }}>{cellValues.value}</div>;
    }
  },
  {
    field: "coder",
    headerName: "Coder",
    width: "150",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "question",
    headerName: "Question",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "title",
    headerName: "Added For",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "addedBy",
    headerName: "Added By",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "category",
    width: "300",
    headerName: "Category",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
];

export const feedBackCodesColumns = [
  {
    field: "explanation",
    headerName: "Explanation",
    width: "900",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "choice",
    headerName: "The participant choice",
    width: "500",
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  { field: "date", headerName: "Submitted Answer Date", type: "dateTime", width: 190 }
];
