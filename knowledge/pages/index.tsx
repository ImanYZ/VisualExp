import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import HomeSearch from "../components/HomeSearch";
import MasonryNodes from "../components/MasonryNodes";
import PagesNavbar from "../components/PagesNavbar";
import { getSortedPostsData } from "../lib/nodes";
import { KnowledgeNode } from "../src/knowledgeTypes";

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

const HomePage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  const handleSearch = (text: string) => {
    router.push({ query: { q: text } });
  };

  return (
    <PagesNavbar>
      <HomeSearch sx={{ mb: 5 }} onSearch={handleSearch}></HomeSearch>
      <MasonryNodes nodes={data} />
    </PagesNavbar>
  );
};

export default HomePage;
