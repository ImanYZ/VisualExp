import { getSortedPostsData } from "../lib/nodes";
import PagesNavbar from "../components/PagesNavbar";
import { GetServerSideProps, NextPage } from "next";
import { KnowledgeNode } from "../src/knowledgeTypes";
import Masonry from "@mui/lab/Masonry";
import MasonryNodeItem from "../components/MasonryNodeItem";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SearchInput from "../components/SearchInput";
import { Button } from "@mui/material";

type Props = {
  data: KnowledgeNode[];
};
// This value is considered fresh for ten seconds (s-maxage=10).
// If a request is repeated within the next 10 seconds, the previously
// cached value will still be fresh. If the request is repeated before 59 seconds,
// the cached value will be stale but still render (stale-while-revalidate=59).
//
// In the background, a revalidation request will be made to populate the cache
// with a fresh value. If you refresh the page, you will see the new value.
export const getServerSideProps: GetServerSideProps<Props> = async ({
  res,
}) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      data: allPostsData,
    },
  };
};

const Home: NextPage<Props> = ({ data }) => {
  const handleSearch = (text: string) => {
    console.log("text", text);
  };

  const renderMasonry = () => {
    return data.map((el) => <MasonryNodeItem key={el.id} node={el} />);
  };

  return (
    <PagesNavbar thisPage="Node">
      <Container>
        <Box sx={{ mb: 2, display: "flex", flexDirection: "row" }}>
          <SearchInput onSearch={handleSearch}></SearchInput>
          <Button>Search</Button>
        </Box>
        <Masonry
          columns={4}
          spacing={2}
          defaultHeight={450}
          defaultColumns={4}
          defaultSpacing={1}
        >
          {renderMasonry()}
        </Masonry>
      </Container>
    </PagesNavbar>
  );
};

export default Home;
