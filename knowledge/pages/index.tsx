import { getSortedPostsData } from "../lib/nodes";
import PagesNavbar from "../components/PagesNavbar";
import { GetServerSideProps, NextPage } from "next";
import { KnowledgeNode } from "../src/knowledgeTypes";
import Masonry from "@mui/lab/Masonry";
import MasonryNodeItem from "../components/NodeItem";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import SearchInput from "../components/SearchInput";
import { Button } from "@mui/material";

type Props = {
  data: KnowledgeNode[];
};

export const getServerSideProps: GetServerSideProps<Props> = async ({}) => {
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
    <PagesNavbar>
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
