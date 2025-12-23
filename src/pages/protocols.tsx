export async function getServerSideProps() {
  return {
    props: {
      seo: {
        title: "Protocols",
      },
    },
  };
}

export default function Protocols() {
  return <h1>Protocols</h1>;
}
